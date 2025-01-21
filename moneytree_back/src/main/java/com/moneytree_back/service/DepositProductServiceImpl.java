package com.moneytree_back.service;

import com.moneytree_back.config.DepositApiConfig;
import com.moneytree_back.domain.DepositProduct;
import com.moneytree_back.dto.DepositProductDTO;
import com.moneytree_back.repository.DepositProductRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class DepositProductServiceImpl implements DepositProductService {

    private final DepositProductRepository depositProductRepository; // 예금 상품 저장소
    private final WebClient webClient; // WebClient를 이용한 API 호출
    private final DepositApiConfig depositApiConfig; // API 관련 설정 정보
    private final ModelMapper modelMapper; // ModelMapper 인스턴스

    // API 데이터를 받아와 예금 상품을 저장
    @Override
    public void saveDepositProducts(List<DepositProductDTO> depositProductDTOs) {
        List<DepositProduct> depositProducts = depositProductDTOs.stream()
                .map(dto -> modelMapper.map(dto, DepositProduct.class)) // DTO -> Entity 변환
                .collect(Collectors.toList());
        depositProductRepository.saveAll(depositProducts); // 저장소에 모든 상품 저장
    }

    // 모든 예금 상품 조회
    @Override
    public List<DepositProductDTO> getAllDepositProducts() {
        return depositProductRepository.findAll().stream()
                .map(product -> modelMapper.map(product, DepositProductDTO.class)) // Entity -> DTO 변환
                .collect(Collectors.toList());
    }

    // 특정 예금 상품 조회 (ID 기준)
    @Override
    public DepositProductDTO getDepositProductById(Long depositProductId) {
        DepositProduct product = depositProductRepository.findById(depositProductId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예금 상품이 존재하지 않습니다."));
        return modelMapper.map(product, DepositProductDTO.class); // Entity -> DTO 변환
    }

    // 특정 은행의 예금 상품 조회
    @Override
    public List<DepositProductDTO> getDepositProductsByBankName(String bankName) {
        return depositProductRepository.findByBankName(bankName).stream()
                .map(product -> modelMapper.map(product, DepositProductDTO.class)) // Entity -> DTO 변환
                .collect(Collectors.toList());
    }

    // 최소 금액 이상의 예금 상품 조회
    @Override
    public List<DepositProductDTO> getDepositProductsByMinAmount(BigDecimal depositMinAmount) {
        return depositProductRepository.findByDepositMinAmountGreaterThanEqual(depositMinAmount).stream()
                .map(product -> modelMapper.map(product, DepositProductDTO.class)) // Entity -> DTO 변환
                .collect(Collectors.toList());
    }

    // 예금 상품 생성
    @Override
    public DepositProductDTO createDepositProduct(DepositProductDTO depositProductDTO) {
        DepositProduct product = modelMapper.map(depositProductDTO, DepositProduct.class); // DTO -> Entity 변환
        DepositProduct savedProduct = depositProductRepository.save(product); // 생성된 상품 저장
        return modelMapper.map(savedProduct, DepositProductDTO.class); // Entity -> DTO 변환
    }

    // 예금 상품 수정
    @Override
    public DepositProductDTO updateDepositProduct(Long depositProductId, DepositProductDTO depositProductDTO) {
        DepositProduct existingProduct = depositProductRepository.findById(depositProductId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예금 상품이 존재하지 않습니다."));

        // 기존 상품 정보 업데이트
        existingProduct.setDepositProductName(depositProductDTO.getDepositProductName());
        existingProduct.setBankName(depositProductDTO.getBankName());
        existingProduct.setDepositJoinWay(depositProductDTO.getDepositJoinWay());
        existingProduct.setDepositMinAmount(depositProductDTO.getDepositMinAmount());

        DepositProduct updatedProduct = depositProductRepository.save(existingProduct); // 업데이트된 상품 저장
        return modelMapper.map(updatedProduct, DepositProductDTO.class); // Entity -> DTO 변환
    }

    // 예금 상품 삭제
    @Override
    public void deleteDepositProduct(Long depositProductId) {
        if (!depositProductRepository.existsById(depositProductId)) {
            throw new IllegalArgumentException("해당 예금 상품이 존재하지 않습니다.");
        }
        depositProductRepository.deleteById(depositProductId); // 상품 삭제
    }

    // 서버 실행 시 api 호출
    @PostConstruct
    @Override
    public void fetchAndStoreDepositProducts() {
        try {
            // 기존 데이터 삭제
            depositProductRepository.deleteAll();

            List<DepositProductDTO> allProducts = new ArrayList<>();
            int pageNo = 1;
            int maxPage = 3; // 최대 3페이지까지 조회

            // 여러 페이지 조회
            while (pageNo <= maxPage) {
                Map<String, Object> response = webClient.get()
                        .uri(depositApiConfig.getBaseUrl() + "?auth=" + depositApiConfig.getKey()
                                + "&topFinGrpNo=020000&pageNo=" + pageNo)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                        .block();

                if (response != null && response.containsKey("result")) {
                    Map<String, Object> result = (Map<String, Object>) response.get("result");
                    List<Map<String, Object>> baseList = (List<Map<String, Object>>) result.get("baseList");

                    if (baseList == null || baseList.isEmpty()) {
                        break;
                    }

                    List<DepositProductDTO> pageProducts = baseList.stream()
                            .map(item -> {
                                // 기존 매핑 로직 유지
                                DepositProductDTO dto = new DepositProductDTO();
                                dto.setDepositProductName((String) item.get("fin_prdt_nm"));
                                dto.setBankName((String) item.get("kor_co_nm"));
                                dto.setDepositJoinWay((String) item.get("join_way"));

                                // 최소금액 파싱
                                String etcNote = (String) item.get("etc_note");
                                BigDecimal minAmount = parseMinAmount(etcNote);
                                if (minAmount != null) {
                                    dto.setDepositMinAmount(minAmount);
                                }

                                // 만기 기간 설정 (6,12,24,36개월 중 랜덤)
                                int[] maturityOptions = {6, 12, 24, 36};
                                int randomIndex = (int) (Math.random() * maturityOptions.length);
                                dto.setDepositMaturityPeriod(maturityOptions[randomIndex]);

                                return dto;
                            })
                            .filter(dto -> dto.getDepositProductName() != null &&
                                    dto.getBankName() != null &&
                                    !dto.getBankName().isEmpty())
                            .distinct()
                            .collect(Collectors.toList());

                    allProducts.addAll(pageProducts);
                }
                pageNo++;
            }

            // 중복 제거 후 30개 선택
            List<DepositProductDTO> selectedProducts = allProducts.stream()
                    .filter(dto -> dto.getDepositMinAmount() != null)
                    .sorted(Comparator.comparing(DepositProductDTO::getDepositMinAmount))
                    .distinct()
                    .limit(30)
                    .collect(Collectors.toList());

            if (!selectedProducts.isEmpty()) {
                saveDepositProducts(selectedProducts);
                System.out.println("Total products saved: " + selectedProducts.size());
            }
        } catch (Exception e) {
            System.err.println("Error fetching deposit products: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private BigDecimal parseMinAmount(String etcNote) {
        if (etcNote == null) {
            return null;
        }

        try {
            // 최소금액/최저금액 관련 문구 찾기
            String[] patterns = {"최소[^0-9]*([0-9]+)", "최저[^0-9]*([0-9]+)"};
            for (String pattern : patterns) {
                Pattern r = Pattern.compile(pattern);
                Matcher m = r.matcher(etcNote);
                if (m.find()) {
                    String amount = m.group(1);
                    // 만원 단위로 되어있으면 10000 곱하기
                    if (etcNote.contains("만원")) {
                        return new BigDecimal(amount).multiply(new BigDecimal("10000"));
                    }
                    return new BigDecimal(amount);
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing min amount: " + e.getMessage());
        }
        return null;
    }
}
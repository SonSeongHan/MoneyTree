package com.moneytree_back.service;

import com.moneytree_back.config.recommendApi.DepositApiConfig;
import com.moneytree_back.domain.DepositProduct;
import com.moneytree_back.dto.DepositProductDTO;
import com.moneytree_back.repository.DepositProductRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepositProductServiceImpl implements DepositProductService {

    @Autowired
    private EntityManagerFactory entityManagerFactory;
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
        // DTO로 변환 후 반환
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
        // 은행명으로 검색하여 DTO로 변환
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

        // 데이터 필드 업데이트
        existingProduct.setDepositProductName(depositProductDTO.getDepositProductName());
        existingProduct.setBankName(depositProductDTO.getBankName());
        existingProduct.setDepositJoinWay(depositProductDTO.getDepositJoinWay());
        existingProduct.setDepositMinAmount(depositProductDTO.getDepositMinAmount());
        existingProduct.setDepositMaturityPeriod(depositProductDTO.getDepositMaturityPeriod());
        existingProduct.setDepositInterestRateType(depositProductDTO.getDepositInterestRateType());
        existingProduct.setDepositBaseInterestRate(depositProductDTO.getDepositBaseInterestRate());
        existingProduct.setDepositPrimeInterestRate(depositProductDTO.getDepositPrimeInterestRate());


        DepositProduct updatedProduct = depositProductRepository.save(existingProduct); // 업데이트된 상품 저장
        return modelMapper.map(updatedProduct, DepositProductDTO.class); // Entity -> DTO 변환
    }

    // 예금 상품 삭제
    @Override
    public void deleteDepositProduct(Long depositProductId) {
        // 존재하는지 확인 후 삭제
        if (!depositProductRepository.existsById(depositProductId)) {
            throw new IllegalArgumentException("해당 예금 상품이 존재하지 않습니다.");
        }
        depositProductRepository.deleteById(depositProductId); // 상품 삭제
    }

    @Override
    public List<DepositProductDTO> getDepositProductsByInterestRateType(String depositInterestRateType) {
        return depositProductRepository.findByDepositInterestRateType(depositInterestRateType).stream()
                .map(product -> modelMapper.map(product, DepositProductDTO.class)) // Entity -> DTO 변환
                .collect(Collectors.toList());
    }

    @Override
    public List<DepositProductDTO> getDepositProductsByBaseInterestRateRange(BigDecimal minRate, BigDecimal maxRate) {
        return depositProductRepository.findByDepositBaseInterestRateBetween(minRate, maxRate).stream()
                .map(product -> modelMapper.map(product, DepositProductDTO.class)) // Entity -> DTO 변환
                .collect(Collectors.toList());
    }

    @Override
    public List<DepositProductDTO> getDepositProductsByPrimeInterestRate(BigDecimal minPrimeRate) {
        return depositProductRepository.findByDepositPrimeInterestRateGreaterThanEqual(minPrimeRate).stream()
                .map(product -> modelMapper.map(product, DepositProductDTO.class)) // Entity -> DTO 변환
                .collect(Collectors.toList());
    }

    // 서버 실행 시 api 호출
    @PostConstruct
    @Override
    public void fetchAndStoreDepositProducts() {
        try {
            // 기존 데이터 삭제
            depositProductRepository.deleteAll();

            // ID 시퀀스 초기화 (사용하는 DB에 따라 다른 방법 필요할 수 있음)
            try {
                EntityManager entityManager = entityManagerFactory.createEntityManager();
                entityManager.getTransaction().begin();
                entityManager.createNativeQuery("ALTER TABLE deposit_product AUTO_INCREMENT = 1").executeUpdate();
                entityManager.getTransaction().commit();
                entityManager.close();
            } catch (Exception e) {
                System.err.println("Failed to reset sequence: " + e.getMessage());
            }

            List<DepositProductDTO> allProducts = new ArrayList<>();
            int pageNo = 1;
            int maxPage = 20;
            Set<String> productNames = new HashSet<>();

            while (pageNo <= maxPage) {
                Map<String, Object> response = webClient.get()
                        .uri(depositApiConfig.getBaseUrl() + "?auth=" + depositApiConfig.getKey()
                                + "&topFinGrpNo=020000&pageNo=" + pageNo)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                        .block();

                if (response == null || !response.containsKey("result")) {
                    break;
                }

                Map<String, Object> result = (Map<String, Object>) response.get("result");
                List<Map<String, Object>> baseList = (List<Map<String, Object>>) result.get("baseList");
                List<Map<String, Object>> optionList = (List<Map<String, Object>>) result.get("optionList");

                if (baseList == null || baseList.isEmpty()) {
                    break;
                }

                for (Map<String, Object> item : baseList) {
                    String productName = (String) item.get("fin_prdt_nm");
                    String bankName = (String) item.get("kor_co_nm");
                    String etcNote = (String) item.get("etc_note");

                    if (productName == null || bankName == null || productNames.contains(productName)) {
                        continue;
                    }

                    DepositProductDTO dto = new DepositProductDTO();
                    dto.setDepositProductName(productName);
                    dto.setBankName(bankName);
                    dto.setDepositJoinWay((String) item.get("join_way"));

                    BigDecimal minAmount = parseMinAmount(etcNote);
                    if (minAmount == null) {
                        minAmount = new BigDecimal("1000000");
                    }
                    dto.setDepositMinAmount(minAmount);
                    dto.setDepositMaturityPeriod(generateRandomMaturityPeriod());

                    // 옵션 데이터 매핑
                    if (optionList != null) {
                        optionList.stream()
                                .filter(option -> {
                                    return option.get("fin_prdt_cd").equals(item.get("fin_prdt_cd"));
                                })
                                .findFirst()
                                .ifPresent(option -> {
                                    dto.setDepositInterestRateType((String) option.get("intr_rate_type_nm"));
                                    dto.setDepositBaseInterestRate(new BigDecimal(option.get("intr_rate").toString()));
                                    dto.setDepositPrimeInterestRate(new BigDecimal(option.get("intr_rate2").toString()));
                                });
                    }

                    productNames.add(productName);
                    allProducts.add(dto);
                }

                pageNo++;

                if (allProducts.size() >= 40) {
                    break;
                }
            }

            if (!allProducts.isEmpty()) {
                List<DepositProductDTO> selectedProducts = selectProductsWithEvenDistribution(allProducts);

                if (!selectedProducts.isEmpty()) {
                    // ID를 1부터 순차적으로 설정
                    for (int i = 0; i < selectedProducts.size(); i++) {
                        DepositProduct entity = convertToEntity(selectedProducts.get(i));
                        entity.setDepositProductId((long) (i + 1));  // ID를 1부터 시작하도록 설정
                        depositProductRepository.save(entity);
                    }
                    System.out.println("Successfully saved " + selectedProducts.size() + " products with sequential IDs");
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching deposit products: " + e.getMessage());
            e.printStackTrace();
        }

    }

    // Entity 변환 메소드 추가
    private DepositProduct convertToEntity(DepositProductDTO dto) {
        DepositProduct entity = new DepositProduct();
        entity.setDepositProductName(dto.getDepositProductName());
        entity.setBankName(dto.getBankName());
        entity.setDepositJoinWay(dto.getDepositJoinWay());
        entity.setDepositMinAmount(dto.getDepositMinAmount());
        entity.setDepositMaturityPeriod(dto.getDepositMaturityPeriod());
        entity.setDepositInterestRateType(dto.getDepositInterestRateType()); // 추가
        entity.setDepositBaseInterestRate(dto.getDepositBaseInterestRate()); // 추가
        entity.setDepositPrimeInterestRate(dto.getDepositPrimeInterestRate()); // 추가
        return entity;
    }

    private List<DepositProductDTO> selectProductsWithEvenDistribution(List<DepositProductDTO> allProducts) {
        if (allProducts.size() < 30) {
            return allProducts; // 30개 미만이면 전체 반환
        }

        // 최소금액 기준으로 정렬
        allProducts.sort(Comparator.comparing(DepositProductDTO::getDepositMinAmount));

        List<DepositProductDTO> selectedProducts = new ArrayList<>();
        int totalProducts = allProducts.size();
        int targetSize = 30;

        // 균등한 간격으로 선택
        double step = (double) (totalProducts - 1) / (targetSize - 1);
        for (int i = 0; i < targetSize; i++) {
            int index = Math.min((int) (i * step), totalProducts - 1);
            selectedProducts.add(allProducts.get(index));
        }

        // 선택된 상품들을 랜덤하게 섞기
        Collections.shuffle(selectedProducts);
        return selectedProducts;
    }

    private int generateRandomMaturityPeriod() {
        int[] maturityOptions = {6, 12, 24, 36};
        return maturityOptions[new Random().nextInt(maturityOptions.length)];
    }

    private BigDecimal parseMinAmount(String etcNote) {
        if (etcNote == null) {
            return null;
        }

        try {
            String[] patterns = {"최소[^0-9]*([0-9]+)", "최저[^0-9]*([0-9]+)"};
            for (String pattern : patterns) {
                Pattern r = Pattern.compile(pattern);
                Matcher m = r.matcher(etcNote);
                if (m.find()) {
                    String amount = m.group(1);
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
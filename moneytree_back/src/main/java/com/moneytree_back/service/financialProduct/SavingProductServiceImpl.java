package com.moneytree_back.service.financialProduct;

import com.moneytree_back.config.recommendApi.SavingApiConfig;
import com.moneytree_back.domain.financialProduct.SavingProduct;
import com.moneytree_back.dto.financialProduct.SavingProductDTO;
import com.moneytree_back.repository.financialProduct.SavingProductRepository;
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
public class SavingProductServiceImpl implements SavingProductService {

    @Autowired
    private EntityManagerFactory entityManagerFactory;
    private final SavingProductRepository savingProductRepository;
    private final WebClient webClient;
    private final SavingApiConfig savingApiConfig;
    private final ModelMapper modelMapper;

    // 적금 상품 저장
    @Override
    public void saveSavingProducts(List<SavingProductDTO> savingProductDTOs) {
        List<SavingProduct> savingProducts = savingProductDTOs.stream()
                .map(dto -> modelMapper.map(dto, SavingProduct.class)) // dto를 엔티티로 변환 후
                .collect(Collectors.toList());
        savingProductRepository.saveAll(savingProducts); // repository에 저장
    }

    // 모든 적금 상품 저장
    @Override
    public List<SavingProductDTO> getAllSavingProducts() {
        return savingProductRepository.findAll().stream()
                .map(product -> modelMapper.map(product, SavingProductDTO.class))
                .collect(Collectors.toList());
    }

    // id 검색으로 적금 조회
    @Override
    public SavingProductDTO getSavingProductById(Long savingProductId) {
        SavingProduct product = savingProductRepository.findById(savingProductId)
                .orElseThrow(() -> new IllegalArgumentException("해당 적금 상품이 존재하지 않습니다."));
        return modelMapper.map(product, SavingProductDTO.class);
    }

    // 특정 은행 적금 조회
    @Override
    public List<SavingProductDTO> getSavingProductsByBankName(String savingBankName) {
        return savingProductRepository.findBySavingBankNameContaining(savingBankName).stream()
                .map(product -> modelMapper.map(product, SavingProductDTO.class))
                .collect(Collectors.toList());
    }


    // 최소 금액 적금 조회
    @Override
    public List<SavingProductDTO> getSavingProductsByMinAmount(BigDecimal savingMinAmount) {
        return savingProductRepository.findBySavingMinAmountGreaterThanEqual(savingMinAmount).stream()
                .map(product -> modelMapper.map(product, SavingProductDTO.class))
                .collect(Collectors.toList());
    }

    // 적금 상품 생성
    @Override
    public SavingProductDTO createSavingProduct(SavingProductDTO savingProductDTO) {
        SavingProduct product = modelMapper.map(savingProductDTO, SavingProduct.class); // dto를 엔티티로 변환
        SavingProduct savedProduct = savingProductRepository.save(product); // 그리고 저장
        return modelMapper.map(savedProduct, SavingProductDTO.class); // 엔티티를 dto로 변환해서 반환
    }

    // 적금 상품 수정
    @Override
    public SavingProductDTO updateSavingProduct(Long savingProductId, SavingProductDTO savingProductDTO) {
        SavingProduct existingProduct = savingProductRepository.findById(savingProductId)
                .orElseThrow(() -> new IllegalArgumentException("해당 적금 상품이 존재하지 않습니다."));

        // 기존 상품을 새로운 값으로 업데이트
        existingProduct.setSavingProductName(savingProductDTO.getSavingProductName());
        existingProduct.setSavingBankName(savingProductDTO.getSavingBankName());
        existingProduct.setSavingJoinWay(savingProductDTO.getSavingJoinWay());
        existingProduct.setSavingMinAmount(savingProductDTO.getSavingMinAmount());
        existingProduct.setSavingMaxAmount(savingProductDTO.getSavingMaxAmount());
        existingProduct.setSavingMaturityPeriod(savingProductDTO.getSavingMaturityPeriod());
        existingProduct.setSavingInterestRateType(savingProductDTO.getSavingInterestRateType());
        existingProduct.setSavingBaseInterestRate(savingProductDTO.getSavingBaseInterestRate());
        existingProduct.setSavingPrimeInterestRate(savingProductDTO.getSavingPrimeInterestRate());

        SavingProduct updatedProduct = savingProductRepository.save(existingProduct);
        return modelMapper.map(updatedProduct, SavingProductDTO.class);
    }

    // 특정 적금 삭제
    @Override
    public void deleteSavingProduct(Long savingProductId) {
        if (!savingProductRepository.existsById(savingProductId)) {
            throw new IllegalArgumentException("해당 적금 상품이 존재하지 않습니다.");
        }
        savingProductRepository.deleteById(savingProductId);
    }

    // 이자율 유형별 적금 상품 조회
    @Override
    public List<SavingProductDTO> getSavingProductsByInterestRateType(String savingInterestRateType) {
        return savingProductRepository.findBySavingInterestRateType(savingInterestRateType).stream()
                .map(product -> modelMapper.map(product, SavingProductDTO.class))
                .collect(Collectors.toList());
    }

    // 기본 이자율 범위 내의 적금 상품을 조회
    @Override
    public List<SavingProductDTO> getSavingProductsByBaseInterestRateRange(BigDecimal minRate, BigDecimal maxRate) {
        return savingProductRepository.findBySavingBaseInterestRateBetween(minRate, maxRate).stream()
                .map(product -> modelMapper.map(product, SavingProductDTO.class))
                .collect(Collectors.toList());
    }

    // 최고 우대 이자율 이상인 적금 상품을 조회
    @Override
    public List<SavingProductDTO> getSavingProductsByPrimeInterestRate(BigDecimal minPrimeRate) {
        return savingProductRepository.findBySavingPrimeInterestRateGreaterThanEqual(minPrimeRate).stream()
                .map(product -> modelMapper.map(product, SavingProductDTO.class))
                .collect(Collectors.toList());
    }

    // 서버 시작 시 API 새로 불러와서 적금 상품 데이터 저장
    @PostConstruct
    @Override
    public void fetchAndStoreSavingProducts() {

        if (savingProductRepository.count() > 0) {
            return;
        }

        try {
            savingProductRepository.deleteAll();

            try {
                EntityManager entityManager = entityManagerFactory.createEntityManager();
                entityManager.getTransaction().begin();
                entityManager.createNativeQuery("ALTER TABLE saving_product AUTO_INCREMENT = 1").executeUpdate();
                entityManager.getTransaction().commit();
                entityManager.close();
            } catch (Exception e) {
                System.err.println("Failed to reset sequence: " + e.getMessage());
            }

            List<SavingProductDTO> allProducts = new ArrayList<>();
            int pageNo = 1;
            int maxPage = 20;
            Set<String> productNames = new HashSet<>();

            while (pageNo <= maxPage) {
                Map<String, Object> response = webClient.get()
                        .uri(savingApiConfig.getBaseUrl() + "?auth=" + savingApiConfig.getKey()
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

                    SavingProductDTO dto = new SavingProductDTO();
                    dto.setSavingProductName(productName);
                    dto.setSavingBankName(bankName);
                    dto.setSavingJoinWay((String) item.get("join_way"));

                    BigDecimal minAmount = parseMinAmount(etcNote);
                    if (minAmount == null) {
                        minAmount = new BigDecimal("10000");
                    }
                    dto.setSavingMinAmount(minAmount);
                    dto.setSavingMaxAmount(minAmount.multiply(new BigDecimal("1000")));
                    dto.setSavingMaturityPeriod(generateRandomMaturityPeriod());

                    if (optionList != null) {
                        optionList.stream()
                                .filter(option -> option.get("fin_prdt_cd").equals(item.get("fin_prdt_cd")))
                                .findFirst()
                                .ifPresent(option -> {
                                    dto.setSavingInterestRateType((String) option.get("intr_rate_type_nm"));
                                    dto.setSavingBaseInterestRate(new BigDecimal(option.get("intr_rate").toString()));
                                    dto.setSavingPrimeInterestRate(new BigDecimal(option.get("intr_rate2").toString()));
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
                List<SavingProductDTO> selectedProducts = selectProductsWithEvenDistribution(allProducts);

                if (!selectedProducts.isEmpty()) {
                    for (int i = 0; i < selectedProducts.size(); i++) {
                        SavingProduct entity = convertToEntity(selectedProducts.get(i));
                        entity.setSavingProductId((long) (i + 1));
                        savingProductRepository.save(entity);
                    }
                    System.out.println("Successfully saved " + selectedProducts.size() + " products with sequential IDs");
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching saving products: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // DTO들 엔티티로 변환
    private SavingProduct convertToEntity(SavingProductDTO dto) {
        SavingProduct entity = new SavingProduct();
        entity.setSavingProductName(dto.getSavingProductName());
        entity.setSavingBankName(dto.getSavingBankName());
        entity.setSavingJoinWay(dto.getSavingJoinWay());
        entity.setSavingMinAmount(dto.getSavingMinAmount());
        entity.setSavingMaxAmount(dto.getSavingMaxAmount());
        entity.setSavingMaturityPeriod(dto.getSavingMaturityPeriod());
        entity.setSavingInterestRateType(dto.getSavingInterestRateType());
        entity.setSavingBaseInterestRate(dto.getSavingBaseInterestRate());
        entity.setSavingPrimeInterestRate(dto.getSavingPrimeInterestRate());
        return entity;
    }

    // 상품 리스트 균등하게 30개 골라서 픽
    private List<SavingProductDTO> selectProductsWithEvenDistribution(List<SavingProductDTO> allProducts) {
        if (allProducts.size() < 30) {
            return allProducts;
        }

        allProducts.sort(Comparator.comparing(SavingProductDTO::getSavingMinAmount));

        List<SavingProductDTO> selectedProducts = new ArrayList<>();
        int totalProducts = allProducts.size();
        int targetSize = 30;

        double step = (double) (totalProducts - 1) / (targetSize - 1);
        for (int i = 0; i < targetSize; i++) {
            int index = Math.min((int) (i * step), totalProducts - 1);
            selectedProducts.add(allProducts.get(index));
        }

        // 선택된 리스트들 섞음
        Collections.shuffle(selectedProducts);
        return selectedProducts;
    }

    private int generateRandomMaturityPeriod() {
        int[] maturityOptions = {6, 12, 24, 36};
        return maturityOptions[new Random().nextInt(maturityOptions.length)];
    }

    // 금액 string을 금액으로 변환
    private BigDecimal parseMinAmount(String etcNote) {
        if (etcNote == null) {
            return null;
        }

        // 글자 패턴 정의
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
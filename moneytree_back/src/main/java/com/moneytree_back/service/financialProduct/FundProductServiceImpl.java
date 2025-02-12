package com.moneytree_back.service.financialProduct;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree_back.config.recommendApi.FundApiConfig;
import com.moneytree_back.domain.financialProduct.FundProduct;
import com.moneytree_back.dto.financialProduct.FundProductDTO;
import com.moneytree_back.repository.financialProduct.FundProductRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FundProductServiceImpl implements FundProductService {

    @Autowired
    private EntityManagerFactory entityManagerFactory;
    private final FundProductRepository fundProductRepository;
    private final WebClient webClient;
    private final FundApiConfig fundApiConfig;
    private final ModelMapper modelMapper;

    @Override
    public List<FundProductDTO> getAllFundProducts() {
        return fundProductRepository.findAll().stream()
                .map(product -> modelMapper.map(product, FundProductDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public FundProductDTO getFundProductById(Long fundProductId) {
        FundProduct product = fundProductRepository.findById(fundProductId)
                .orElseThrow(() -> new IllegalArgumentException("해당 펀드 상품이 존재하지 않습니다."));
        return modelMapper.map(product, FundProductDTO.class);
    }

    @Override
    public List<FundProductDTO> getFundProductsByFundTotalAmountRange(BigDecimal minFundTotalAmount, BigDecimal maxFundTotalAmount) {
        return fundProductRepository.findByFundProductTotalAmountBetween(minFundTotalAmount, maxFundTotalAmount).stream()
                .map(product -> modelMapper.map(product, FundProductDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<FundProductDTO> getFundProductsByFundManagementFee(BigDecimal minFundManagementFee) {
        return fundProductRepository.findByFundProductManagementFeeGreaterThanEqual(minFundManagementFee).stream()
                .map(product -> modelMapper.map(product, FundProductDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<FundProductDTO> getFundProductsByFundRedemptionFee(BigDecimal maxFundRedemptionFee) {
        return fundProductRepository.findByFundProductRedemptionFeeLessThanEqual(maxFundRedemptionFee).stream()
                .map(product -> modelMapper.map(product, FundProductDTO.class))
                .collect(Collectors.toList());
    }

    // 전체 필터링
    @Override
    public List<FundProductDTO> getFilteredFundProducts(
            BigDecimal minFundTotalAmount, BigDecimal maxFundTotalAmount,
            BigDecimal minFundManagementFee, BigDecimal maxFundRedemptionFee,
            LocalDate fundProductMaturityDate
    ) {
        return fundProductRepository.findFilteredFundProducts(
                        minFundTotalAmount, maxFundTotalAmount, minFundManagementFee, maxFundRedemptionFee, fundProductMaturityDate
                ).stream()
                .map(product -> modelMapper.map(product, FundProductDTO.class))
                .collect(Collectors.toList());
    }

    @PostConstruct
    public void fetchAndStoreFundProducts() {

        if (fundProductRepository.count() > 0) {
            return;
        }

        try {
            List<FundProductDTO> allProducts = new ArrayList<>();
            String[] years = {"2023", "2022", "2021", "2020", "2019"};
            Random random = new Random();

            for (String year : years) {
                try {
                    String responseBody = webClient.get()
                            .uri("/api/fundType?fundType=00&y=" + year + "&key=" + fundApiConfig.getKey())
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();

                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode rootNode = mapper.readTree(responseBody);
                    JsonNode dataArray = rootNode.get("result_11");

                    if (dataArray != null && dataArray.isArray()) {
                        for (JsonNode item : dataArray) {
                            try {
                                FundProductDTO dto = new FundProductDTO();
                                dto.setFundProductYear(year);
                                dto.setFundProductType(item.get("fd").asText("Unknown"));
                                dto.setFundProductManager(item.get("mng").asText("Unknown"));
                                dto.setFundProductName(item.get("asn").asText("Unknown"));

                                // 날짜 형식 변환
                                String expDate = item.get("exp").asText();
                                dto.setFundProductExpiration(LocalDate.parse(expDate));

                                // amt를 BigDecimal로 변환
                                String amtStr = item.get("amt").asText("0");
                                dto.setFundProductTotalAmount(new BigDecimal(amtStr));

                                // 수수료 적용
                                BigDecimal managementFee = new BigDecimal(String.format("%.2f", 0.3 + (1.7 * random.nextDouble()))); // 0.3% ~ 2.0%
                                BigDecimal redemptionFee = new BigDecimal(String.format("%.2f", 0.0 + (1.5 * random.nextDouble()))); // 0% ~ 1.5%

                                dto.setFundProductManagementFee(managementFee);
                                dto.setFundProductRedemptionFee(redemptionFee);

                                allProducts.add(dto);
                                System.out.println("Successfully added product: " + dto.getFundProductName() +
                                        " | Management Fee: " + managementFee + "% | Redemption Fee: " + redemptionFee + "%");

                                if (allProducts.size() >= 30) {
                                    break;
                                }
                            } catch (Exception e) {
                                System.err.println("Error processing item: " + e.getMessage());
                                continue;
                            }
                        }
                    }

                    if (allProducts.size() >= 30) {
                        break;
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching data for year " + year + ": " + e.getMessage());
                    continue;
                }
            }

            // 최종 저장
            if (!allProducts.isEmpty()) {
                List<FundProductDTO> selectedProducts = allProducts.subList(0, Math.min(30, allProducts.size()));

                for (int i = 0; i < selectedProducts.size(); i++) {
                    try {
                        FundProduct entity = convertToEntity(selectedProducts.get(i));
                        entity.setFundProductId((long) (i + 1));
                        FundProduct savedEntity = fundProductRepository.save(entity);
                        System.out.println("Saved product: " + savedEntity.getFundProductName());
                    } catch (Exception e) {
                        System.err.println("Error saving product: " + e.getMessage());
                    }
                }

                System.out.println("Successfully saved " + selectedProducts.size() + " products");
            } else {
                System.err.println("No products were collected");
            }
        } catch (Exception e) {
            System.err.println("Fatal error in fetchAndStoreFundProducts: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private FundProduct convertToEntity(FundProductDTO dto) {
        FundProduct entity = new FundProduct();
        entity.setFundProductYear(dto.getFundProductYear());
        entity.setFundProductType(dto.getFundProductType());
        entity.setFundProductManager(dto.getFundProductManager());
        entity.setFundProductName(dto.getFundProductName());
        entity.setFundProductExpiration(dto.getFundProductExpiration());
        entity.setFundProductTotalAmount(dto.getFundProductTotalAmount());
        entity.setFundProductManagementFee(dto.getFundProductManagementFee());
        entity.setFundProductRedemptionFee(dto.getFundProductRedemptionFee());
        return entity;
    }
}
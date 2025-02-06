package com.moneytree_back.service;

import com.moneytree_back.config.recommendApi.StockApiConfig;
import com.moneytree_back.domain.StockProduct;
import com.moneytree_back.dto.StockProductDTO;
import com.moneytree_back.repository.StockProductRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockProductServiceImpl implements StockProductService {

    @Autowired
    private EntityManagerFactory entityManagerFactory;
    private final StockProductRepository stockProductRepository;
    private final WebClient webClient;
    private final StockApiConfig stockApiConfig;
    private final ModelMapper modelMapper;

    @PostConstruct
    @Override
    public void fetchAndStoreStockProducts() {
        try {
            // 기존 데이터 삭제
            stockProductRepository.deleteAll();

            // ID 시퀀스 초기화 (기존 코드 유지)
            resetSequence();

            // 어제 날짜 가져오기
            LocalDate yesterday = LocalDate.now().minusDays(1);
            String formattedDate = yesterday.format(DateTimeFormatter.ofPattern("yyyyMMdd"));

            // 첫 페이지로 총 개수 확인
            Map<String, Object> firstResponse = fetchStockData(formattedDate, 1);
            if (firstResponse == null || !firstResponse.containsKey("response")) {
                throw new RuntimeException("Failed to fetch initial stock data");
            }

            // 총 데이터 수와 필요한 페이지 수 계산
            Map<String, Object> body = (Map<String, Object>) ((Map<String, Object>) firstResponse.get("response")).get("body");
            int totalCount = Integer.parseInt(body.get("totalCount").toString());
            int numOfRows = 30;
            int totalPages = (int) Math.ceil((double) totalCount / numOfRows);

            List<StockProduct> allStockProducts = new ArrayList<>();

            // 모든 페이지 조회
            for (int page = 1; page <= totalPages; page++) {
                Map<String, Object> response = fetchStockData(formattedDate, page);
                if (response != null && response.containsKey("response")) {
                    List<StockProduct> pageProducts = parseStockProducts(response);
                    allStockProducts.addAll(pageProducts);
                }
            }

            // 저장
            stockProductRepository.saveAll(allStockProducts);
            System.out.println("Successfully saved " + allStockProducts.size() + " stock products");
        } catch (Exception e) {
            System.err.println("Error fetching stock products: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private Map<String, Object> fetchStockData(String date, int page) {
        // URI를 직접 생성하여 인코딩 제어
        String baseUrl = stockApiConfig.getBaseUrl();
        String apiKey = stockApiConfig.getKey();

        try {
            // URI를 문자열로 직접 구성
            String uriString = baseUrl +
                    "?pageNo=" + page +
                    "&numOfRows=30" +
                    "&basDt=" + date +
                    "&resultType=json" +
                    "&serviceKey=" + apiKey;

            // URI 객체로 변환 (추가 인코딩 없이)
            URI uri = new URI(uriString);

            return webClient.get()
                    .uri(uri)  // URI 객체를 직접 사용
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .onErrorResume(e -> {
                        System.err.println("Error fetching data: " + e.getMessage());
                        System.err.println("Requested URI: " + uri);
                        e.printStackTrace();
                        return Mono.empty();
                    })
                    .block();

        } catch (Exception e) {
            System.err.println("Error creating URI: " + e.getMessage());
            return null;
        }
    }


    private List<StockProduct> parseStockProducts(Map<String, Object> response) {
        List<StockProduct> stockProducts = new ArrayList<>();
        Map<String, Object> body = (Map<String, Object>) ((Map<String, Object>) response.get("response")).get("body");
        List<Map<String, Object>> items = (List<Map<String, Object>>) ((Map<String, Object>) body.get("items")).get("item");

        for (Map<String, Object> item : items) {
            StockProduct stock = new StockProduct();

            // API 응답 필드를 엔티티 필드로 매핑
            stock.setStockProductBaseDate(LocalDate.parse(item.get("basDt").toString(),
                    DateTimeFormatter.ofPattern("yyyyMMdd")));
            stock.setStockProductName(item.get("itmsNm").toString());
            stock.setStockMarketCategory(item.get("mrktCtg").toString());
            stock.setStockClosingPrice(new BigDecimal(item.get("clpr").toString()));
            stock.setStockPriceDifference(new BigDecimal(item.get("vs").toString()));
            stock.setStockFluctuationRate(new BigDecimal(item.get("fltRt").toString()));
            stock.setStockOpeningPrice(new BigDecimal(item.get("mkp").toString()));
            stock.setStockHighestPrice(new BigDecimal(item.get("hipr").toString()));
            stock.setStockLowestPrice(new BigDecimal(item.get("lopr").toString()));
            stock.setStockTradingVolume(Long.parseLong(item.get("trqu").toString()));
            stock.setStockTradingValue(new BigDecimal(item.get("trPrc").toString()));
            stock.setStockMarketCapitalization(new BigDecimal(item.get("mrktTotAmt").toString()));

            stockProducts.add(stock);
        }

        return stockProducts;
    }

    private void resetSequence() {
        try {
            EntityManager entityManager = entityManagerFactory.createEntityManager();
            entityManager.getTransaction().begin();
            entityManager.createNativeQuery("ALTER TABLE stock_product AUTO_INCREMENT = 1").executeUpdate();
            entityManager.getTransaction().commit();
            entityManager.close();
        } catch (Exception e) {
            System.err.println("Failed to reset sequence: " + e.getMessage());
        }
    }

    @Override
    public List<StockProductDTO> getLatestStockProducts() {
        return stockProductRepository.findAll().stream()
                .map(product -> modelMapper.map(product, StockProductDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<StockProductDTO> getTopRisingStocks(int limit) {
        return stockProductRepository.findAll().stream()
                .sorted(Comparator.comparing(StockProduct::getStockFluctuationRate).reversed())
                .limit(limit)
                .map(product -> modelMapper.map(product, StockProductDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<StockProductDTO> getTopFallingStocks(int limit) {
        return stockProductRepository.findAll().stream()
                .sorted(Comparator.comparing(StockProduct::getStockFluctuationRate))
                .limit(limit)
                .map(product -> modelMapper.map(product, StockProductDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<StockProductDTO> getStocksByTradingVolume(long minTradingVolume) {
        return stockProductRepository.findAll().stream()
                .filter(product -> product.getStockTradingVolume() >= minTradingVolume)
                .map(product -> modelMapper.map(product, StockProductDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<StockProductDTO> getStocksByMarketCap(BigDecimal minMarketCap) {
        return stockProductRepository.findAll().stream()
                .filter(product -> product.getStockMarketCapitalization().compareTo(minMarketCap) >= 0)
                .map(product -> modelMapper.map(product, StockProductDTO.class))
                .collect(Collectors.toList());
    }
}
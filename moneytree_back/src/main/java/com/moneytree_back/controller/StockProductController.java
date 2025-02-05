package com.moneytree_back.controller;

import com.moneytree_back.dto.StockProductDTO;
import com.moneytree_back.repository.StockProductRepository;
import com.moneytree_back.service.StockProductService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stock-products")
@RequiredArgsConstructor
public class StockProductController {

    private final StockProductService stockProductService;
    private final StockProductRepository stockProductRepository;
    private final ModelMapper modelMapper;

    // 최신 30개 주식 조회
    @GetMapping("/latest")
    public List<StockProductDTO> getLatestStockProducts() {
        return stockProductService.getLatestStockProducts();
    }

    // 상승률 TOP N 조회
    @GetMapping("/top-rising")
    public List<StockProductDTO> getTopRisingStocks(@RequestParam(defaultValue = "10") int limit) {
        return stockProductService.getTopRisingStocks(limit);
    }

    // 하락률 TOP N 조회
    @GetMapping("/top-falling")
    public List<StockProductDTO> getTopFallingStocks(@RequestParam(defaultValue = "10") int limit) {
        return stockProductService.getTopFallingStocks(limit);
    }

    // 최소 거래량 필터 적용
    @GetMapping("/by-trading-volume")
    public List<StockProductDTO> getStocksByTradingVolume(@RequestParam long minTradingVolume) {
        return stockProductService.getStocksByTradingVolume(minTradingVolume);
    }

    // 시가총액 필터 적용
    @GetMapping("/by-market-cap")
    public List<StockProductDTO> getStocksByMarketCap(@RequestParam BigDecimal minMarketCap) {
        return stockProductService.getStocksByMarketCap(minMarketCap);
    }

    // 특정 시장(KOSPI, KOSDAQ) 조회
    @GetMapping("/by-market")
    public List<StockProductDTO> getStocksByMarketCategory(@RequestParam String stockProductMarketCategory) {
        return stockProductRepository.findByStockMarketCategory(stockProductMarketCategory).stream()
                .map(product -> modelMapper.map(product, StockProductDTO.class))
                .collect(Collectors.toList());
    }

    // 종목명 검색 (부분 검색 포함)
    @GetMapping("/search")
    public List<StockProductDTO> searchStockProductsByName(@RequestParam String stockProductName) {
        return stockProductRepository.findByStockProductNameContaining(stockProductName).stream()
                .map(product -> modelMapper.map(product, StockProductDTO.class))
                .collect(Collectors.toList());
    }
}

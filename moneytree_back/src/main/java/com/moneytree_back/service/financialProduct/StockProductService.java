package com.moneytree_back.service.financialProduct;

import com.moneytree_back.dto.financialProduct.StockProductDTO;
import java.math.BigDecimal;
import java.util.List;

public interface StockProductService {

    // API에서 데이터를 불러와서 DB에 저장하는 메서드
    void fetchAndStoreStockProducts();

    // 최신 주식 데이터 30개 불러오기
    List<StockProductDTO> getLatestStockProducts();

    // 전일 대비 가장 많이 오른 종목 TOP N 조회
    List<StockProductDTO> getTopRisingStocks(int limit);

    // 전일 대비 가장 많이 하락한 종목 TOP N 조회
    List<StockProductDTO> getTopFallingStocks(int limit);

    // 최소 거래량 필터만 적용한 종목 조회
    List<StockProductDTO> getStocksByTradingVolume(long minTradingVolume);

    // 시가총액 필터만 적용한 종목 조회
    List<StockProductDTO> getStocksByMarketCap(BigDecimal minMarketCap);

}
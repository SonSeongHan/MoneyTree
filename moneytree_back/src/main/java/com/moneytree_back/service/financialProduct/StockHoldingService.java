package com.moneytree_back.service.financialProduct;

import com.moneytree_back.dto.financialProduct.StockHoldingDTO;

import java.math.BigDecimal;
import java.util.List;

public interface StockHoldingService {
    /**
     * 특정 주식 계좌의 보유 주식 목록 조회
     * @param stockAccountNumber 주식 계좌 번호
     * @return 보유 주식 목록
     */
    List<StockHoldingDTO> getStockHoldingsByAccount(Long stockAccountNumber);

    /**
     * 주식 매수 (보유 주식 추가)
     * @param stockAccountNumber 주식 계좌 번호
     * @param stockProductId 주식 상품 ID
     * @param quantity 매수 수량
     * @param price 매수 단가
     * @return 업데이트된 보유 주식 정보
     */
    StockHoldingDTO buyStock(Long stockAccountNumber, Long stockProductId, Integer quantity, BigDecimal price);

    /**
     * 주식 매도 (보유 주식 감소)
     * @param stockAccountNumber 주식 계좌 번호
     * @param stockProductId 주식 상품 ID
     * @param quantity 매도 수량
     * @return 업데이트된 보유 주식 정보
     */
    StockHoldingDTO sellStock(Long stockAccountNumber, Long stockProductId, Integer quantity);
}
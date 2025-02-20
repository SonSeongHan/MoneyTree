package com.moneytree_back.service.financialProduct;

import com.moneytree_back.dto.financialProduct.StockAccountDTO;

import java.math.BigDecimal;

public interface StockAccountService {
    /**
     * 특정 입출금 계좌에 연결된 주식 계좌 조회
     * @param dandwAcId 입출금 계좌 ID
     * @return StockAccountDTO 주식 계좌 정보
     */
    StockAccountDTO getStockAccountByDandwacId(String dandwAcId);

    /**
     * 주식 계좌 생성
     * @param dandwAcId 입출금 계좌 ID
     * @return 생성된 주식 계좌 정보
     */
    StockAccountDTO createStockAccount(String dandwAcId);

    /**
     * 주식 계좌에서 입출금 계좌로 자금 이체
     * 실제 이체는 DandwacService에서 처리
     */
    void withdrawToDepositAccount(Long stockAccountNumber, String dandwAcId, BigDecimal amount);
}


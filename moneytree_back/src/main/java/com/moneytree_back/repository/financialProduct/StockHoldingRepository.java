package com.moneytree_back.repository.financialProduct;

import com.moneytree_back.domain.financialProduct.StockAccount;
import com.moneytree_back.domain.financialProduct.StockHolding;
import com.moneytree_back.domain.financialProduct.StockProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockHoldingRepository extends JpaRepository<StockHolding, Long> {
    // 특정 주식 계좌에 속한 모든 보유 주식 찾기
    List<StockHolding> findByStockAccount(StockAccount stockAccountNumber);

    // 특정 주식 계좌에서 특정 주식 상품 보유 내역 찾기
    StockHolding findByStockAccountAndStockProduct(StockAccount stockAccountNumber, StockProduct stockProductId);
}
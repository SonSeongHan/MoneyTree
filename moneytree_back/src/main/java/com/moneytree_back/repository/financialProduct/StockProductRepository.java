package com.moneytree_back.repository.financialProduct;

import com.moneytree_back.domain.financialProduct.StockProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StockProductRepository extends JpaRepository<StockProduct, Long> {

    // 특정 날짜 기준으로 조회
    List<StockProduct> findByStockProductBaseDate(LocalDate stockProductBaseDate);

    // 특정 시장(KOSPI, KOSDAQ 등)만 조회
    List<StockProduct> findByStockMarketCategory(String stockProductMarketCategory);

    // 특정 종목 조회 (이름 검색, 부분 검색 포함)
    List<StockProduct> findByStockProductNameContaining(String stockProductName);

}

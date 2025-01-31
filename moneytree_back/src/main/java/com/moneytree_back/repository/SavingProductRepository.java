package com.moneytree_back.repository;

import com.moneytree_back.domain.SavingProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SavingProductRepository extends JpaRepository<SavingProduct, Long> {

    // 적금 상품명 검색
    List<SavingProduct> findBySavingProductNameContaining(String savingProductName);

    // 은행명 검색
    List<SavingProduct> findBySavingBankNameContaining(String savingBankName);

    // 최소 금액 이상으로 가입 가능한 적금 상품 검색
    List<SavingProduct> findBySavingMinAmountGreaterThanEqual(BigDecimal savingMinAmount);

    // 최대 금액 이하로 가입 가능한 적금 상품 검색
    List<SavingProduct> findBySavingMaxAmountLessThanEqual(BigDecimal savingMaxAmount);

    // 기본 이율 범위 내 적금 상품 검색
    List<SavingProduct> findBySavingBaseInterestRateBetween(BigDecimal savingMinBaseRate, BigDecimal savingMaxBaseRate);

    // 최고 우대 이율 이상 적금 상품 검색
    List<SavingProduct> findBySavingPrimeInterestRateGreaterThanEqual(BigDecimal savingPrimeInterestRate);

    // 만기 기간으로 검색 (예: 12개월, 24개월 등)
    List<SavingProduct> findBySavingMaturityPeriod(Integer savingMaturityPeriod);

    // 가입 방법(예: 인터넷, 영업점 등)으로 검색
    List<SavingProduct> findBySavingJoinWayContaining(String savingJoinWay);

    // 특정 날짜 이후에 생성된 적금 상품 검색
    List<SavingProduct> findBySavingProductCreatedAtAfter(java.time.LocalDateTime createdAfter);

    // 이율 유형(복리/단리)로 검색
    List<SavingProduct> findBySavingInterestRateType(String savingInterestRateType);
}

package com.moneytree_back.repository.financialProduct;

import com.moneytree_back.domain.financialProduct.DepositProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DepositProductRepository extends JpaRepository<DepositProduct, Long> {

    // 특정 은행의 예금 상품 조회
    List<DepositProduct> findByBankName(String bankName);

    // 최소 가입 금액 이상인 예금 상품 조회
    List<DepositProduct> findByDepositMinAmountGreaterThanEqual(BigDecimal depositMinAmount);

    // 만기 기간별 예금 상품 조회
    List<DepositProduct> findByDepositMaturityPeriod(Integer depositMaturityPeriod);

    // 특정 이름의 예금 상품 조회 (부분 검색 포함)
    @Query("SELECT dp FROM DepositProduct dp WHERE dp.depositProductName LIKE %:depositProductName%")
    List<DepositProduct> searchByProductName(@Param("depositProductName") String depositProductName);

    // 생성 날짜 범위로 예금 상품 조회
    @Query("SELECT dp FROM DepositProduct dp WHERE dp.depositProductCreatedAt BETWEEN :startDate AND :endDate")
    List<DepositProduct> findByCreatedDateBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // 특정 이율 유형에 따른 예금 상품 조회
    List<DepositProduct> findByDepositInterestRateType(String depositInterestRateType);

    // 기본 이자율 범위 내의 예금 상품 조회
    List<DepositProduct> findByDepositBaseInterestRateBetween(BigDecimal minDepositBaseInterestRate,BigDecimal maxDepositBaseInterestRate);

    // 최고 우대 이자율이 특정 값 이상인 예금 상품 조회
    List<DepositProduct> findByDepositPrimeInterestRateGreaterThanEqual(BigDecimal minDepositPrimeInterestRate);
}
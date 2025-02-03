package com.moneytree_back.repository;

import com.moneytree_back.domain.FundProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FundProductRepository extends JpaRepository<FundProduct, Long> {

    // 특정 유형의 펀드 조회
    List<FundProduct> findByFundProductType(String fundProductType);

    // 특정 운용사의 펀드 조회
    List<FundProduct> findByFundProductManager(String fundProductManager);

    // 특정 펀드 이름으로 조회 (부분 검색 포함)
    List<FundProduct> findByFundProductNameContaining(String fundProductName);

    // 특정 연도의 펀드 조회
    List<FundProduct> findByFundProductYear(String fundProductYear);

    // 펀드 총 규모 범위 내 조회
    List<FundProduct> findByFundProductTotalAmountBetween(BigDecimal minFundTotalAmount, BigDecimal maxFundTotalAmount);

    // 운용 보수가 특정 값 이상인 펀드 조회
    List<FundProduct> findByFundProductManagementFeeGreaterThanEqual(BigDecimal minFundManagementFee);

    // 환매 수수료가 특정 값 이하인 펀드 조회
    List<FundProduct> findByFundProductRedemptionFeeLessThanEqual(BigDecimal maxFundRedemptionFee);

}

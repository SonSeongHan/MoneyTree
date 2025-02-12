package com.moneytree_back.service.financialProduct;

import com.moneytree_back.dto.financialProduct.FundProductDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface FundProductService {

    // 모든 펀드 상품 조회
    List<FundProductDTO> getAllFundProducts();

    // 특정 펀드 상품 조회
    FundProductDTO getFundProductById(Long fundProductId);

    // 펀드 총 규모 범위 내 조회
    List<FundProductDTO> getFundProductsByFundTotalAmountRange(BigDecimal minFundTotalAmount, BigDecimal maxFundTotalAmount);

    // 운용 보수가 특정 값 이상인 펀드 조회
    List<FundProductDTO> getFundProductsByFundManagementFee(BigDecimal minFundManagementFee);

    // 환매 수수료가 특정 값 이하인 펀드 조회
    List<FundProductDTO> getFundProductsByFundRedemptionFee(BigDecimal maxFundRedemptionFee);

    // 전체 필터링
    List<FundProductDTO> getFilteredFundProducts(
            BigDecimal minFundTotalAmount, BigDecimal maxFundTotalAmount,
            BigDecimal minFundManagementFee, BigDecimal maxFundRedemptionFee,
            LocalDate fundProductMaturityDate
    );
}
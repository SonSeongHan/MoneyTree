package com.moneytree_back.service.financialProduct;

import com.moneytree_back.dto.financialProduct.FundAccountDTO;
import com.moneytree_back.dto.financialProduct.FundProductDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface FundAccountService {
    /**
     * 특정 입출금 계좌에 연결된 펀드 계좌 조회
     * @param dandwAcId 입출금 계좌 ID
     * @return FundAccountDTO 펀드 계좌 정보
     */
    List<FundAccountDTO> getFundAccountsByDandwacId(String dandwAcId);

    /**
     * 펀드 계좌 생성
     * @param dandwAcId 입출금 계좌 ID
     * @return 생성된 펀드 계좌 정보
     */
    FundAccountDTO createFundAccount(String dandwAcId);

    /**
     * 펀드 투자
     */
    FundAccountDTO investInFund(String dandwAcId, Long fundProductId, BigDecimal investmentAmount);

    /**
     * 펀드 환매 가능 여부 확인
     */
    boolean checkRedemptionEligibility(Long fundAccountNumber);

    /**
     * 펀드 환매
     */
    FundAccountDTO redeemFund(Long fundAccountNumber, BigDecimal amount);

    /**
     * 투자 가능한 펀드 상품 목록 조회
     */
    List<FundProductDTO> getAvailableFundProducts(
            BigDecimal minTotalAmount,
            BigDecimal maxTotalAmount,
            BigDecimal maxManagementFee,
            BigDecimal maxRedemptionFee,
            LocalDate minMaturityDate
    );

    /**
     * 예상 수익 계산
     */
    BigDecimal calculateExpectedProfit(Long fundAccountNumber);

    /**
     * 환매 시 예상 수령액 계산
     */
    BigDecimal calculateRedemptionAmount(Long fundAccountNumber, BigDecimal amount);

    /**
     * 펀드 상태 조회
     */
    String getFundStatus(Long fundAccountNumber);

    /**
     * 만기일까지 남은 기간 조회
     */
    Long getRemainingDays(Long fundAccountNumber);
}
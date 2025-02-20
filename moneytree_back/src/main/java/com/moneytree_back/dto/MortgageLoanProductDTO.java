package com.moneytree_back.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MortgageLoanProductDTO {
  private Long id;
  private String dclsMonth;
  private String finCoNo;
  private String finPrdtCd;
  private String korCoNm;
  private String finPrdtNm;
  private String joinWay;
  private String loanInciExpn;
  private String erlyRpayFee;
  private String dlyRate;
  private String loanLmt;
  private String dclsStrtDay;
  private String dclsEndDay;
  private String finCoSubmDay;
  // 계산된 회원별 대출 한도 정보
  private long availableLoanLimit;
  private String formattedAvailableLoanLimit;
  private long fixedLoanLimit;
  private String formattedFixedLoanLimit;
  private boolean loanLimitSet;
  private long borrowedAmount;   // 가입 시 빌린 금액
  private long balance;          // 계좌 잔액
}

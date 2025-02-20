package com.moneytree_back.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberLoanDTO {
  private String memberId;
  private long borrowedAmount;
  private long availableLoanLimit;  // 현재 대출 가능 금액
  private long maxLoanLimit;       // 최대 대출 한도

  // 추가된 필드들
  private long assets;             // 자산
  private long liabilities;        // 부채
  private long fixedExpenses;      // 고정 지출
  private long fixedIncome;        // 고정 수입
}

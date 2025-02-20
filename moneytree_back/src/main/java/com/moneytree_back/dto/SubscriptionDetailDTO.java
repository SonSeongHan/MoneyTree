package com.moneytree_back.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionDetailDTO {
  private String memberId;      // 회원 ID
  private String finPrdtNm;     // 상품명
  private long loanAmount;      // 가입 시 대출 금액
  private long availableLoanLimit;  // 남은 대출 가능 금액
  private boolean loanLimitSet;     // 대출 한도 계산 여부
  private long balance;        // 부동산 계좌 잔액
  // 필요하다면 더 많은 필드
}

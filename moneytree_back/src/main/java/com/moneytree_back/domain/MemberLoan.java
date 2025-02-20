package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class MemberLoan {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String memberId;

  @Column(name = "max_loan_limit", nullable = false)
  private Long maxLoanLimit;  // 최초 계산된 최대 대출 한도 (변경되지 않음)

  @Column(name = "borrowed_amount", nullable = false)
  private Long borrowedAmount = 0L;  // 대출 금액

  @Column(name = "available_loan_limit", nullable = false)
  private Long availableLoanLimit = 0L;  // 대출 가능 금액 (차감되는 값)

  @Column(name = "has_loan", nullable = false)
  private boolean hasLoan = false;  // 대출 상태 (대출이 있는지 여부)

  @Column(name = "assets")
  private Long assets = 0L;  // 자산

  @Column(name = "liabilities")
  private Long liabilities = 0L;  // 부채

  @Column(name = "fixed_expenses")
  private Long fixedExpenses = 0L;  // 고정 지출

  @Column(name = "fixed_income")
  private Long fixedIncome = 0L;  // 고정 수입

  @Column(name = "loan_limit_set", nullable = false)
  private boolean loanLimitSet = false;  // 대출 한도 설정 여부

  // 기본 생성자 추가
  public MemberLoan() {
    // 기본 생성자
  }

  // 매개변수로 값 설정하는 생성자 추가
  public MemberLoan(String memberId, Long maxLoanLimit, Long borrowedAmount, Long availableLoanLimit,
                    boolean hasLoan, Long assets, Long liabilities, Long fixedExpenses,
                    Long fixedIncome, boolean loanLimitSet) {
    this.memberId = memberId;
    this.maxLoanLimit = maxLoanLimit;  // 최초 계산된 최대 대출 한도 설정
    this.borrowedAmount = borrowedAmount;
    this.availableLoanLimit = availableLoanLimit;
    this.hasLoan = hasLoan;
    this.assets = assets;
    this.liabilities = liabilities;
    this.fixedExpenses = fixedExpenses;
    this.fixedIncome = fixedIncome;
    this.loanLimitSet = loanLimitSet;
  }

  // 대출 한도 설정 (최초 한도만 설정, 이후에는 변경되지 않음)
  public void setLoanLimit(long loanLimit) {
    if (!loanLimitSet) {  // 대출 한도가 아직 설정되지 않았다면만 실행
      this.maxLoanLimit = loanLimit;  // 최초 계산된 최대 대출 한도를 설정
      this.availableLoanLimit = loanLimit;  // 대출 가능 금액은 최대 대출 한도로 설정
      this.loanLimitSet = true;  // 대출 한도가 설정됨
    }
  }

  // 대출 한도 반환 (설정된 대출 한도 반환, 설정되지 않았다면 maxLoanLimit 반환)
  public Long getAvailableLoanLimit() {
    if (loanLimitSet) {
      return availableLoanLimit;  // 설정된 대출 한도 반환
    }
    return maxLoanLimit;  // 대출 한도가 설정되지 않았다면 최대 대출 한도 반환
  }

  // 대출 금액 차감 (대출 가능 금액 차감)
  public void subtractLoanAmount(long amount) {
    if (amount > availableLoanLimit) {
      throw new IllegalArgumentException("대출 가능한 금액을 초과했습니다.");  // 대출 금액 초과시 예외 발생
    }

    availableLoanLimit -= amount;  // 대출 가능 금액 차감
    borrowedAmount += amount;  // 대출 받은 금액 증가
    hasLoan = borrowedAmount > 0;  // 대출 상태 업데이트 (대출 금액이 있으면 hasLoan = true)
  }

  // 최대 대출 한도 반환 (최초 계산된 최대 한도만 반환)
  public Long getMaxLoanLimit() {
    return maxLoanLimit;  // 최초 계산된 최대 한도 반환
  }
}

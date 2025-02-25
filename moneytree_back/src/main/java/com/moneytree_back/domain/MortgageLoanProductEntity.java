package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mortgage_loan_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MortgageLoanProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

  @Column(name = "dcls_month", length = 10)
  private String dclsMonth;

  @Column(name = "fin_co_no", length = 20)
  private String finCoNo;

  @Column(name = "fin_prdt_cd", length = 50)
  private String finPrdtCd;

  @Column(name = "kor_co_nm", length = 100)
  private String korCoNm;

  @Column(name = "fin_prdt_nm", length = 200)
  private String finPrdtNm;

  @Column(name = "join_way", length = 100)
  private String joinWay;

  @Column(name = "loan_inci_expn", columnDefinition = "TEXT")
  private String loanInciExpn;

  @Column(name = "erly_rpay_fee", columnDefinition = "TEXT")
  private String erlyRpayFee;

  @Column(name = "dly_rate", columnDefinition = "TEXT")
  private String dlyRate;

  @Column(name = "loan_lmt", columnDefinition = "TEXT")
  private String loanLmt;

  @Column(name = "dcls_strt_day", length = 10)
  private String dclsStrtDay;

  @Column(name = "dcls_end_day", length = 10)
  private String dclsEndDay;

  @Column(name = "fin_co_subm_day", length = 20)
  private String finCoSubmDay;

  // 회원별 고정 대출 한도 및 계산된 현재 대출 가능 금액 (백엔드 계산 후 설정)
  @Transient
  private Long fixedLoanLimit;

  @Transient
  private String formattedFixedLoanLimit;

  @Transient
  private Long availableLoanLimit;

  @Transient
  private String formattedAvailableLoanLimit;
}

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

  // 신고월 (예: "202501")
  @Column(name = "dcls_month", length = 10)
  private String dclsMonth;

  // 금융회사 번호
  @Column(name = "fin_co_no", length = 20)
  private String finCoNo;

  // 금융상품 코드
  @Column(name = "fin_prdt_cd", length = 50)
  private String finPrdtCd;

  // 금융회사 이름
  @Column(name = "kor_co_nm", length = 100)
  private String korCoNm;

  // 금융 상품 이름
  @Column(name = "fin_prdt_nm", length = 200)
  private String finPrdtNm;

  // 가입 방식
  @Column(name = "join_way", length = 100)
  private String joinWay;

  // 인지세 등 비용 정보
  @Column(name = "loan_inci_expn", columnDefinition = "TEXT")
  private String loanInciExpn;

  // 중도상환수수료 관련 정보
  @Column(name = "erly_rpay_fee", columnDefinition = "TEXT")
  private String erlyRpayFee;

  // 연체율 정보
  @Column(name = "dly_rate", columnDefinition = "TEXT")
  private String dlyRate;

  // 대출한도 정보
  @Column(name = "loan_lmt", columnDefinition = "TEXT")
  private String loanLmt;

  // 신고 시작일
  @Column(name = "dcls_strt_day", length = 10)
  private String dclsStrtDay;

  // 신고 종료일 (null 가능)
  @Column(name = "dcls_end_day", length = 10)
  private String dclsEndDay;

  // 금융회사 제출일
  @Column(name = "fin_co_subm_day", length = 20)
  private String finCoSubmDay;
}

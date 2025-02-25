package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "fund_account")
public class FundAccount {

    @Id
    @Column(name = "fund_account_number", updatable = false, nullable = false)
    private Long fundAccountNumber; // 기본 키, 펀드 계좌 ID

    @Column(name = "fund_investment_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal fundInvestmentAmount; // 투자 금액

    @Column(name = "fund_investment_date")
    private LocalDate fundInvestmentDate; // 투자 날짜

    @Column(name = "fund_maturity_date")
    private LocalDate fundMaturityDate; // 만기일

    @Column(name = "fund_expected_return", precision = 5, scale = 2)
    private BigDecimal fundExpectedReturn; // 예상 수익률

    @Column(name = "fund_status")
    private String fundStatus; // 계좌 상태 (운용 중, 만기, 해지됨 등)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fund_product_id", nullable = true)
    private FundProduct fundProductId; // 연결된 펀드 상품

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dandw_ac_id", nullable = false)
    private Dandwac dandwAcId;
}

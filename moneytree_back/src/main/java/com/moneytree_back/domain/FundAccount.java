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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fund_account_number", updatable = false, nullable = false)
    private Long fundAccountNumber; // 기본 키, 펀드 계좌 ID

    @Column(name = "fund_investment_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal fundInvestmentAmount; // 투자 금액

    @Column(name = "fund_investment_date")
    private LocalDate fundInvestmentDate; // 투자 날짜

    @Column(name = "fund_maturity_date")
    private LocalDate fundMaturityDate; // 만기일

    @Column(name = "fund_current_value", precision = 15, scale = 2)
    private BigDecimal fundCurrentValue; // 현재 평가 금액, 남은 금액

    @Column(name = "fund_status")
    private String fundStatus; // 계좌 상태 (운용 중, 만기, 해지됨 등)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fund_product_id", nullable = false)
    private FundProduct fundProductId; // 연결된 펀드 상품

    // 나중에 추가할 회원 연동
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "member_id")
    // private Member member;

    // 나중에 추가할 입출금 계좌 연동
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "deposit_account_id")
    // private DepositAccount depositAccount;
}

package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "stock_account")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAccount {
    @Id
    @Column(name = "stock_account_number", nullable = false, updatable = false)
    private Long stockAccountNumber; // 주식 계좌 번호 (PK)

    @Column(name = "stock_account_balance", precision = 15, scale = 2, nullable = false)
    private BigDecimal stockAccountBalance; // 주식 계좌 잔액

    @Column(name = "stock_account_created_at", nullable = false)
    private LocalDateTime stockAccountCreatedAt; // 주식 계좌 생성일

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dandw_ac_id", nullable = false)
    private Dandwac dandwAcId; // 입출금 계좌 (연결된 계좌)

    @OneToMany(mappedBy = "stockAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockHolding> stockHoldings; // 주식 보유 목록 (연관된 주식 보유 내역)
}
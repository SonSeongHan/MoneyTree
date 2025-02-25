package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "stock_holding")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockHolding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_holding_id", nullable = false, updatable = false)
    private Long stockHoldingId; // 주식 보유 내역 ID (PK)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_account_id", nullable = false)
    private StockAccount stockAccount; // 주식 계좌 (연관된 계좌)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_product_id", nullable = false)
    private StockProduct stockProduct; // 주식 상품 (보유한 주식)

    @Column(name = "stock_holding_quantity", nullable = false)
    private Integer stockHoldingQuantity; // 보유 주식 수량

    @Column(name = "stock_holding_avg_price", precision = 15, scale = 2)
    private BigDecimal stockHoldingAvgPrice; // 평균 매입가

    @Column(name = "stock_holding_acquired_at")
    private LocalDateTime stockHoldingAcquiredAt; // 매입 일자
}


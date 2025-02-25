package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "deposit_termination")
public class DepositTermination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deposit_termination_id", updatable = false, nullable = false)
    private Long depositTerminationId; // 기본 키, 해지 아이디

    @Column(name = "deposit_termination_date", nullable = false)
    private LocalDateTime depositTerminationDate; // 해지 일자

    @Column(name = "deposit_termination_reason", length = 255)
    private String depositTerminationReason; // 해지 사유

    @Column(name = "deposit_penalty_fee", precision = 15, scale = 2)
    private BigDecimal depositPenaltyFee; // 위약금

    @Column(name = "deposit_refund_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal depositRefundAmount; // 환급 금액

    @Column(name = "deposit_service_fee", precision = 15, scale = 2, nullable = false)
    private BigDecimal depositServiceFee; // 해지 시 사이트 수익 (수수료)

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deposit_account_number", nullable = false)
    private DepositAccount depositAccount; // 해지된 예금 계좌
}


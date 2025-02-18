package com.moneytree_back.domain.financialProduct;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "saving_termination")
public class SavingTermination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "saving_termination_id", updatable = false, nullable = false)
    private Long savingTerminationId; // 기본 키, 해지 아이디

    @Column(name = "saving_termination_date", nullable = false)
    private LocalDateTime savingTerminationDate; // 해지 일자

    @Column(name = "saving_termination_reason", length = 255)
    private String savingTerminationReason; // 해지 사유

    @Column(name = "saving_penalty_fee", precision = 15, scale = 2)
    private BigDecimal savingPenaltyFee; // 위약금

    @Column(name = "saving_refund_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal savingRefundAmount; // 환급 금액

    @Column(name = "saving_service_fee", precision = 15, scale = 2, nullable = false)
    private BigDecimal savingServiceFee; // 해지 시 사이트 수익 (수수료)

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saving_account_number", nullable = false)
    private SavingAccount savingAccount; // 해지된 적금 계좌
}
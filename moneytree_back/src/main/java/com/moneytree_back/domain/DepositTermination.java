package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private Long depositTerminationId; // 기본 키

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deposit_account_id", nullable = false)
    private DepositAccount depositAccount; // 외래 키

    @Enumerated(EnumType.STRING)
    @Column(name = "deposit_termination_type", nullable = false, length = 20)
    private TerminationType depositTerminationType;

    @Column(name = "deposit_termination_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal depositTerminationRate;

    @Column(name = "deposit_termination_final_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal depositTerminationFinalAmount;

    @Column(name = "deposit_termination_date", nullable = false)
    private LocalDate depositTerminationDate;

    @CreationTimestamp
    @Column(name = "deposit_termination_created_at", updatable = false)
    private LocalDateTime depositTerminationCreatedAt;

    @UpdateTimestamp
    @Column(name = "deposit_termination_updated_at")
    private LocalDateTime depositTerminationUpdatedAt;
}


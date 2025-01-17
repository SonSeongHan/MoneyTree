package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "deposit_termination")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepositTermination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deposit_termination_id", updatable = false, nullable = false)
    private Long depositTerminationId; // 기본 키

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deposit_account_id", nullable = false)
    private DepositAccount depositAccount; // 외래 키

    @Enumerated(EnumType.STRING)
    @Column(name = "termination_type", nullable = false, length = 20)
    private TerminationType terminationType;

    @Column(name = "termination_rate", nullable = false, precision = 5, scale = 2)
    private Double terminationRate;

    @Column(name = "termination_final_amount", nullable = false, precision = 15, scale = 2)
    private Double terminationFinalAmount;

    @Column(name = "termination_date", nullable = false)
    private LocalDate terminationDate;

    @CreationTimestamp
    @Column(name = "termination_created_at", updatable = false)
    private LocalDateTime terminationCreatedAt;

    @UpdateTimestamp
    @Column(name = "termination_updated_at")
    private LocalDateTime terminationUpdatedAt;
}


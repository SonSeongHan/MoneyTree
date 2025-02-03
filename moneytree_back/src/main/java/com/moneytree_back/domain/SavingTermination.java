package com.moneytree_back.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SavingTermination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "saving_termination_id", updatable = false, nullable = false)
    private Long savingTerminationId; // 기본 키

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saving_account_id", nullable = false)
    private DepositAccount savingAccount; // 외래 키

    @Enumerated(EnumType.STRING)
    @Column(name = "saving_termination_type", nullable = false, length = 20)
    private TerminationType savingTerminationType;

    @Column(name = "saving_termination_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal savingTerminationRate;

    @Column(name = "saving_termination_final_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal savingTerminationFinalAmount;

    @Column(name = "saving_termination_date", nullable = false)
    private LocalDate savingTerminationDate;

    @CreationTimestamp
    @Column(name = "saving_termination_created_at", updatable = false)
    private LocalDateTime savingTerminationCreatedAt;

    @UpdateTimestamp
    @Column(name = "saving_termination_updated_at")
    private LocalDateTime savingTerminationUpdatedAt;
}

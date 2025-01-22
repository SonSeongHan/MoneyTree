package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name="deposit_account")
public class DepositAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deposit_account_id", updatable = false, nullable = false)
    private Long depositAccountId; // 기본키

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deposit_product_id", nullable = false)
    @ToString.Exclude // 무한 재귀 방지
    private DepositProduct depositProduct; // 외래 키

    // @Column(name = "dep") // 멤버는 보류

    @Column(name = "deposit_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal depositAmount;

    @Column(name = "deposit_start_date", nullable = false)
    private LocalDate depositStartDate;

    @Column(name = "deposit_end_date", nullable = false)
    private LocalDate depositEndDate;

    @Column(name = "deposit_account_created_at", updatable = false)
    private LocalDateTime depositAccountCreatedAt;

    @UpdateTimestamp
    @Column(name = "deposit_account_updated_at")
    private LocalDateTime depositAccountUpdatedAt;
}

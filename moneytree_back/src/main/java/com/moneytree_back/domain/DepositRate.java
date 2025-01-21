package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "deposit_rate")
public class DepositRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deposit_rate_id", updatable = false, nullable = false)
    private Long depositRateId; // 기본 키

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deposit_product_id", nullable = false)
    private DepositProduct depositProduct; // 외래 키

    @Column(name = "deposit_interest_rate", nullable = false, precision = 5, scale = 2)
    private Double depositInterestRate;

    @Column(name = "deposit_special_rate", precision = 5, scale = 2)
    private Double depositSpecialRate; // 사용 여부는 선택

    @CreationTimestamp
    @Column(name = "deposit_rate_created_at", updatable = false)
    private LocalDateTime depositRateCreatedAt;

    @UpdateTimestamp
    @Column(name = "deposit_rate_updated_at")
    private LocalDateTime depositRateUpdatedAt;
}

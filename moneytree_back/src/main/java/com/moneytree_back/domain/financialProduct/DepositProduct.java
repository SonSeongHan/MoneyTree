package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="deposit_product")
public class DepositProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name ="deposit_product_id", updatable = false, nullable = false)
    private Long depositProductId; // 기본 키

    @Column(name = "deposit_product_name", nullable = false)
    private String depositProductName; // 예금 상품명

    @Column(name = "bank_name") // 보류
    private String bankName; // 은행명

    @Column(name = "deposit_join_way")
    private String depositJoinWay; // 가입 방법(인터넷, 스마트폰 등)

    @Column(name = "deposit_min_amount", precision = 15, scale =2)
    private BigDecimal depositMinAmount; // 최소 가입 금액

    @Column(name = "deposit_maturity_period") // 만기 날짜로 할지 만기 기간으로 할지
    private Integer depositMaturityPeriod; // 개월

    @Column(name = "deposit_interest_rate_type", length = 20)
    private String depositInterestRateType; // 이율 유형 (단리, 복리)

    @Column(name = "deposit_base_interest_rate", precision = 5, scale = 2)
    private BigDecimal depositBaseInterestRate; // 기본 이자율

    @Column(name = "deposit_prime_interest_rate", precision = 5, scale = 2)
    private BigDecimal depositPrimeInterestRate; // 최고 우대 이자율

    @CreationTimestamp
    @Column(name = "deposit_product_created_at", updatable = false)
    private LocalDateTime depositProductCreatedAt;

    @UpdateTimestamp
    @Column(name = "deposit_product_updated_at")
    private LocalDateTime depositProductUpdatedAt;

    @OneToMany(mappedBy = "depositProductId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DepositAccount> depositAccounts = new ArrayList<>();
}


package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
    private String depositProductName;

    @Column(name = "bank_name") // 보류
    private String bankName;

    @Column(name = "deposit_join_way")
    private String depositJoinWay;

    @Column(name = "deposit_min_amount", precision = 15, scale =2)
    private Double depositMinAmount;

    @Column(name = "deposit_maturity_period") // 만기 날짜로 할지 만기 기간으로 할지
    private Integer depositMaturityPeriod; // 개월

    @CreationTimestamp
    @Column(name = "deposit_product_created_at", updatable = false)
    private LocalDateTime depositProductCreatedAt;

    @UpdateTimestamp
    @Column(name = "deposit_product_created_at")
    private LocalDateTime depositProductUpdatedAt;

    @OneToMany(mappedBy = "depositProduct", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DepositRate> depositRates = new ArrayList<>();

    @OneToMany(mappedBy = "depositProduct", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DepositAccount> depositAccounts = new ArrayList<>();
}


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
@Table(name = "saving_product")
public class SavingProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "saving_product_id", updatable = false, nullable = false)
    private Long savingProductId; // 기본키, 적금 상품 아이디

    @Column(name = "saving_product_name", nullable = false)
    private String savingProductName; // 적금 상품명

    @Column(name = "saving_bank_name")
    private String savingBankName; // 은행명

    @Column(name = "saving_join_way")
    private String savingJoinWay; // 가입 방법 (영업점, 인터넷 등)

    @Column(name = "saving_min_amount", precision = 15, scale = 2)
    private BigDecimal savingMinAmount; // 가입 최소 금액

    @Column(name = "saving_max_amount", precision = 15, scale = 2)
    private BigDecimal savingMaxAmount; // 가입 최대 금액

    @Column(name = "saving_maturity_period")
    private Integer savingMaturityPeriod; // 적금 만기 기간

    @Column(name = "saving_interest_rate_type", length = 20)
    private String savingInterestRateType; // 이율 유형 (단기, 복리)

    @Column(name = "saving_base_interest_rate", precision = 5, scale = 2)
    private BigDecimal savingBaseInterestRate; // 기본 이자율

    @Column(name = "saving_prime_interest_rate", precision = 5, scale = 2)
    private BigDecimal savingPrimeInterestRate; // 최고 우대 이자율

    @CreationTimestamp
    @Column(name = "saving_product_created_at", updatable = false)
    private LocalDateTime savingProductCreatedAt; // 생성 일자

    @UpdateTimestamp
    @Column(name = "saving_product_updated_at")
    private LocalDateTime savingProductUpdatedAt; // 수정 일자
}

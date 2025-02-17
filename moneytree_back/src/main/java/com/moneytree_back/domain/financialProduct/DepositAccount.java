package com.moneytree_back.domain.financialProduct;

import com.moneytree_back.domain.Dandwac;
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
    @Column(name = "deposit_account_number", updatable = false, nullable = false)
    private Long depositAccountNumber; // 기본 키, 예금 계좌 번호

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

    @Column(name = "regular_payment_amount")
    private BigDecimal regularPaymentAmount; // 정기 납입액

    @Column(name = "regular_payment_day")
    private Integer regularPaymentDay; // 정기 납입일 (1-28)

    @Column(name = "is_regular_payment")
    private Boolean isRegularPayment; // 정기 납입 여부

    @Column(name = "last_payment_date")
    private LocalDate lastPaymentDate; // 마지막 납입일

    // 예금 상품 연결
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deposit_product_id", nullable = false)
    @ToString.Exclude // 무한 재귀 방지
    private DepositProduct depositProductId; // 외래 키

    // 입출금 계좌 연결
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dandw_ac_id", nullable = false)
    @ToString.Exclude
    private Dandwac dandwAcId;
}

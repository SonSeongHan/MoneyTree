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
@Table(name = "saving_account")
public class SavingAccount {

    @Id
    @Column(name = "saving_account_number", updatable = false, nullable = false)
    private Long savingAccountNumber; // 기본 키, 적금 계좌 번호

    @Column(name = "saving_deposit_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal savingDepositAmount; // 가입 시 설정한 첫 납입 금액

    @Column(name = "saving_start_date", nullable = false)
    private LocalDate savingStartDate; // 적금 가입일

    @Column(name = "saving_end_date", nullable = false)
    private LocalDate savingEndDate; // 적금 만기일

    @Column(name = "saving_account_created_at", updatable = false)
    private LocalDateTime savingAccountCreatedAt; // 계좌 생성 일자

    @UpdateTimestamp
    @Column(name = "saving_account_updated_at")
    private LocalDateTime savingAccountUpdatedAt; // 계좌 마지막 업데이트 일자

    @Column(name = "saving_regular_payment_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal savingRegularPaymentAmount; // 정기 납입 금액 (첫 납입 금액과 동일, 변경 불가)

    @Column(name = "saving_regular_payment_day", nullable = false)
    private Integer savingRegularPaymentDay; // 정기 납입일 (매월 1~28일 중 선택)

    @Column(name = "is_saving_regular_payment", nullable = false)
    private Boolean isSavingRegularPayment = true; // 정기 납입 여부 (항상 true)

    @Column(name = "last_saving_payment_date")
    private LocalDate lastSavingPaymentDate; // 마지막 납입일

    @Enumerated(EnumType.STRING)
    @Column(name = "saving_account_status", nullable = false)
    private SavingAccountStatus savingAccountStatus = SavingAccountStatus.SAVING_ACCOUNT_ACTIVE; // 계좌 상태

    // 적금 상품 연결
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saving_product_id", nullable = false)
    @ToString.Exclude // 무한 재귀 방지
    private SavingProduct savingProductId; // 적금 상품 ID

    // 입출금 계좌 연결
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dandw_ac_id", nullable = false)
    @ToString.Exclude
    private Dandwac dandwAcId; // 입출금 계좌 ID
}

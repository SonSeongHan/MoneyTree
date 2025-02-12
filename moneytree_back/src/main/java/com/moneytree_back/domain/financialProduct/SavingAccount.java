package com.moneytree_back.domain.financialProduct;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "saving_account")
public class SavingAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "saving_account_number", updatable = false, nullable = false)
    private Long savingAccountNumber; // 기본 키, 적금 계좌 번호

    // SavingProduct와의 연관 관계 설정 (ManyToOne)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saving_product_id", nullable = false)
    private SavingProduct savingProduct; // 외래 키, 적금 상품

    @Column(name = "saving_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal savingAmount; // 계좌 금액

    @Column(name = "saving_end_date", nullable = false)
    private LocalDate savingEndDate; // 끝나는 날

    @CreationTimestamp
    @Column(name = "saving_account_created_at", updatable = false)
    private LocalDateTime savingAccountCreatedAt; // 생성 일자

    // Member와의 연관 관계 (보류)
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "member_id")
    // private Member member;
}

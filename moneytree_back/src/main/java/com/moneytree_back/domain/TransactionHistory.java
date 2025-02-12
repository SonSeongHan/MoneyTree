package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 송금(출금)을 진행한 계좌 (보통 본인의 계좌)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id")
    private Dandwac fromAccount;

    // 입금 받은 계좌 (다른 회원의 계좌일 수 있음)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_account_id")
    private Dandwac toAccount;

    // 거래 금액
    private BigDecimal amount;

    // 거래 유형 (송금, 출금, 입금 등)
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type")
    private DandwacType dandwacType;

    // 거래 발생 시각
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    // ✅ 충전/송금 목적을 저장할 필드
    private String depositPurpose;

    // 추가: 송금한 회원의 닉네임 (혹은 이름)
    @Column(name = "from_member_nickname")
    private String fromMemberName;

    // 추가: 돈받은 회원의 닉네임 (혹은 이름)
    @Column(name = "to_member_nickname")
    private String toMemberName;
}

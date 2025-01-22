package com.moneytree_back.domain;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "deposit_withdraw_account")  // 원하는 테이블 명 지정
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Dandwac {
    @Id
    @Column(name = "dandw_ac_id")
    private String dandwAcId;   // PK (입출금 계좌번호)

    // 회원(Member)와의 관계 (외래키: member_id)
    // 이미 Member 엔티티가 존재한다고 가정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")        // FK 컬럼명
    private Member member;

    // 계좌 유형 (ENUM: "입출금") – 단일 값만 쓸 거라면, Enum으로 사용하거나 String 컬럼으로 처리 가능
    @Enumerated(EnumType.STRING)
    @Column(name = "Dandwac_type")
    private DandwacType accountType;

    // 계좌 잔액
    private BigDecimal balance;

    // 계좌 비밀번호 (실제로는 암호화 저장 권장)
    @Column(name = "account_password")
    private String accountPassword;

    // 생성일
    @Column(name = "created_at")
    private LocalDate createdAt;
}

package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    // 회원 ID (PK)

    @Id
    @Column(name = "member_id", nullable = false)
    private String memberId;

    @Column(name = "member_name")
    private String memberName;

    private String residentRegistrationNumber;
    private String memberpassword;
    private Integer member_age;

    @Column(name = "member_phone_number")
    private String memberPhoneNumber;

    private String member_address;

    @Enumerated(EnumType.STRING)
    private MembershipType membershipType;

    private String member_accountNumber;
    private String member_job;
    private Integer member_creditScore;

    @Column(name = "member_created_day")
    private LocalDateTime member_created_day;

    // 계정 활성 여부 (true: 활성, false: 비활성)
    @Column(name = "active")
    private Boolean active;

    // 탈퇴 요청 시 기록 (즉시 비활성화 처리 후 탈퇴 시각 기록)
    @Column(name = "withdrawal_date")
    private LocalDateTime withdrawalDate;

    // 탈퇴 사유
    @Column(name = "withdrawal_reason")
    private String withdrawalReason;
}
package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "withdrawn_member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawnMember {

    // 기존 회원의 ID
    @Id
    @Column(name = "member_id", nullable = false)
    private String memberId;

    // 이름
    @Column(name = "member_name")
    private String memberName;

    // 주민등록번호 (13자리)
    private String residentRegistrationNumber;

    // 비밀번호 (필요 시 암호화되어 저장)
    private String memberpassword;

    // 나이
    private Integer member_age;

    // 핸드폰 번호
    @Column(name = "member_phone_number")
    private String memberPhoneNumber;

    // 주소
    private String member_address;

    // 회원 유형
    @Enumerated(EnumType.STRING)
    private MembershipType membershipType;

    // 계좌번호
    private String member_accountNumber;

    // 직업
    private String member_job;

    // 신용 등급
    private Integer member_creditScore;

    // 가입일
    @Column(name = "member_created_day")
    private LocalDateTime member_created_day;

    // 탈퇴 일시
    @Column(name = "withdrawal_date")
    private LocalDateTime withdrawalDate;

    // 탈퇴 사유
    @Column(name = "withdrawal_reason")
    private String withdrawalReason;
}

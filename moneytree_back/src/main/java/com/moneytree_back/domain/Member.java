package com.moneytree_back.login.domain;

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

    // 여기서는 member_id를 String PK로 사용
    @Id
    @Column(name = "member_id", nullable = false)
    private String memberId;

    // 이름
    private String member_name;

    // 주민등록번호(13자리) - 여기서는 DB 컬럼명 자동 생성
    private String residentRegistrationNumber;

    // 비밀번호
    private String memberpassword;

    // 나이(주민등록번호 기반 계산해서 세팅)
    private Integer member_age;

    // 핸드폰 번호
    @Column(name = "member_phone_number")
    private String memberPhoneNumber;

    // 주소(정회원 필수)
    private String member_address;

    // 회원 유형 (SimpleMember, FullMember 등)
    @Enumerated(EnumType.STRING)
    private MembershipType membershipType;

    // 계좌번호 (정회원 시 필수, SimpleMember면 null 가능)
    private String member_accountNumber;

    // 직업(선택 사항)
    private String member_job;

    // 신용 등급(Null 가능)
    private Integer member_creditScore;

    // 가입일
    @Column(name = "member_created_day")
    private LocalDateTime member_created_day;
}

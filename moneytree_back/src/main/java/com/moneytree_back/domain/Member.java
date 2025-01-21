package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 이름
    private String name;

    // 주민등록번호(7자리 or 13자리)
    private String residentRegistrationNumber;

    // 비밀번호
    private String password;

    // 나이(자동 계산: RRN이 13자리일 때 계산)
    private Integer age;

    // 핸드폰 번호
    private String phoneNumber;

    // 주소(정회원 필수, 간편회원 및 기타 매니저는 nullable)
    private String address;

    // 회원 유형
    @Enumerated(EnumType.STRING)
    private MembershipType membershipType;

    // 계좌번호 (간편회원, 정회원만 생성, 그 외는 Null)
    private String accountNumber;

    // 직업(선택 사항)
    private String job;

    // 신용 등급(Null 가능)
    private Integer creditScore;

    // 가입일
    private LocalDateTime createdAt;
}
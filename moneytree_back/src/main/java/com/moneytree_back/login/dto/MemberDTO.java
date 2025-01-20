package com.moneytree_back.login.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 회원가입/수정 등에서 클라이언트와 주고받을 DTO
 */
@Getter
@Setter
public class MemberDTO {

    private String name;
    private String residentRegistrationNumber;
    private String password;
    private String phoneNumber;
    private String address;
    private String job;
    private Integer creditScore;

    // membershipType은 주민번호 길이에 따라 자동 설정하거나
    // 혹은 직접 ADMIN, 매니저 계정을 만들고 싶으면 여기서 입력받을 수도 있음.
    private String membershipType;
}

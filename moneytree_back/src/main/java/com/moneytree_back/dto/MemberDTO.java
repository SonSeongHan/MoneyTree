package com.moneytree_back.login.dto;

import com.moneytree_back.login.domain.MembershipType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class MemberDTO {

    private String member_id;
    private String member_name;
    private String residentRegistrationNumber;
    private String member_password;
    private Integer member_age;
    private String member_phoneNumber;
    private String member_address;
    private MembershipType membershipType;
    private String accountNumber; // 계좌번호 필드 추가
    private String member_job;
    private Integer member_creditScore;

    // 권한 반환 메서드 (단일 Role)
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + membershipType.name()));
    }

    // 역할 이름 반환 메서드 (단일 Role만 사용)
    public String getRoleName() {
        return "ROLE_" + membershipType.name();
    }

    // 클레임 반환 메서드
    public Map<String, Object> getClaims() {
        return Map.of(
                "member_id", member_id,
                "member_name", member_name,
                "membershipType", membershipType.name(),
                "member_age", member_age
        );
    }

    // 생성자
    public MemberDTO(String memberName, String memberPassword, MembershipType membershipType) {
        this.member_name = memberName;
        this.member_password = memberPassword;
        this.membershipType = membershipType;
    }

}

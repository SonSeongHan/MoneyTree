package com.moneytree_back.dto;

import com.moneytree_back.domain.MembershipType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
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

    @NotBlank(message = "주소는 필수 항목입니다.") // Null 또는 공백 방지
    @Pattern(regexp = "^[\\p{L}\\p{N}\\p{P}\\p{Zs}]+$", message = "주소는 한글, 영문 및 숫자로 구성되어야 합니다.") // 문자 제한
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

    // UTF-8 변환 메서드 (모든 문자열 필드에 적용)
    public void ensureUtf8() {
        try {
            if (member_address != null) {
                byte[] bytes = member_address.getBytes(StandardCharsets.UTF_8);
                member_address = new String(bytes, StandardCharsets.UTF_8);
            }
            if (member_job != null) {
                byte[] bytes = member_job.getBytes(StandardCharsets.UTF_8);
                member_job = new String(bytes, StandardCharsets.UTF_8);
            }
            if (member_name != null) {
                byte[] bytes = member_name.getBytes(StandardCharsets.UTF_8);
                member_name = new String(bytes, StandardCharsets.UTF_8);
            }
            // 필요에 따라 다른 문자열 필드도 동일하게 처리
        } catch (Exception e) {
            throw new RuntimeException("UTF-8 변환 실패", e);
        }
    }

    // 생성자
    public MemberDTO(String memberName, String memberPassword, MembershipType membershipType) {
        this.member_name = memberName;
        this.member_password = memberPassword;
        this.membershipType = membershipType;
    }
}

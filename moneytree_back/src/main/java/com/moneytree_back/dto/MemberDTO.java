package com.moneytree_back.dto;

import com.moneytree_back.domain.MembershipType;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@ToString
public class MemberDTO extends org.springframework.security.core.userdetails.User {

    private String memberId;
    private String member_name;
    private String residentRegistrationNumber;
    private String memberpassword;
    private Integer member_age;
    private String member_phoneNumber;
    private String member_address;
    private MembershipType membershipType;
    private String accountNumber;
    private String member_job;
    private Integer member_creditScore;
    private Integer changeMemberName;


    public MemberDTO(String memberId, String memberPassword, MembershipType membershipType) {
        super(
                memberId,
                "", //체크필터쪽에서 MemberDTO 생성하는 코드를 보면 password를 포함해서 생성하는게 아님.
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + membershipType.name()))
        );
        this.memberId = memberId;
        this.memberpassword = memberPassword;
        this.membershipType = membershipType;
    }


    public MemberDTO() {
        // 파라미터 없는 기본 생성자
        // (User 상위 클래스는 아이디/패스워드/권한을 꼭 넣어야 하므로 임시 값 세팅)
        super("default_id", "default_pw", new ArrayList<>());
    }



    public Map<String, Object> getClaims() {
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("memberId", this.memberId);
        dataMap.put("residentRegistrationNumber", this.residentRegistrationNumber);
        dataMap.put("membershipType", this.membershipType);
        dataMap.put("accountNumber", this.accountNumber);

        return dataMap;
    }
}

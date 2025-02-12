package com.moneytree_back.config.custom;

import com.moneytree_back.domain.member.Member;
import com.moneytree_back.domain.member.MembershipType;
import com.moneytree_back.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Log4j2
@Component
@RequiredArgsConstructor
public class CustomAuthenticationProvider implements AuthenticationProvider {

    private final MemberRepository memberRepository;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        // 1) 토큰에서 아이디/비번/주민등록번호 추출
        String memberId = authentication.getName(); // principal
        String password = (String) authentication.getCredentials(); // credentials
        String rrn = (String) authentication.getDetails(); // setDetails(rrn)로 넣어둔 값

        log.info("CustomAuthProvider >>> memberId={}, pw={}, rrn={}", memberId, password, rrn);

        // 2) DB 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BadCredentialsException("존재하지 않는 아이디입니다."));

        // 3) 회원유형(SimpleMember vs FullMember)에 따라 검증
        if (member.getMembershipType() == MembershipType.SimpleMember) {
            // 간편회원 → 아이디 + 비밀번호만 일치
            if (!member.getMemberpassword().equals(password)) {
                throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
            }
        } else if (member.getMembershipType() == MembershipType.FullMember) {
            // 정회원 → 아이디 + 비밀번호 + 주민등록번호까지
            if (!member.getMemberpassword().equals(password)
                    || !member.getResidentRegistrationNumber().equals(rrn)) {
                throw new BadCredentialsException("정회원: 비밀번호 또는 주민등록번호가 일치하지 않습니다.");
            }
        } else {
            throw new BadCredentialsException("지원하지 않는 회원 유형입니다.");
        }

        // 4) 인증 성공 → 권한 목록 설정
        List<GrantedAuthority> authorities =
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + member.getMembershipType().name()));

        // 5) 인증 객체 생성 → "principal"에 Member 엔티티(또는 DTO)를 담는 방법도 가능
        //    여기서는 그냥 memberId만 principal로, password만 credentials로 전달
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        // principal 자리에 MemberDTO를 넣고 싶다면 별도 변환 가능:
                        // new MemberDTO(...),
                        // 여기서는 그냥 memberId만
                        memberId,
                        password,
                        authorities
                );

        // 만약 로그인 성공 후 SuccessHandler에서 Member 정보를 쓰고 싶다면
        // 여기서 authToken.setDetails(member) 또는 setPrincipal(...)로 넣어둘 수도 있음

        return authToken;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        // UsernamePasswordAuthenticationToken 타입이면 처리
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}

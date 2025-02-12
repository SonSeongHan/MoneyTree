package com.moneytree_back.security;

import com.moneytree_back.domain.member.Member;
import com.moneytree_back.dto.member.MemberDTO;
import com.moneytree_back.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@Log4j2
@RequiredArgsConstructor
public class MemberUserDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String memberId) throws UsernameNotFoundException {
        log.info("----------------loadUserByUsername-----------------------------");

        Member member = memberRepository.getWithRoles(memberId);

        if (member == null) {
            throw new UsernameNotFoundException("Not Found");
        }

        MemberDTO memberDTO = new MemberDTO(
                member.getMemberId(),
                member.getMemberpassword(),
                member.getMembershipType()
        );

        log.info(memberDTO);

        return memberDTO;
    }
}

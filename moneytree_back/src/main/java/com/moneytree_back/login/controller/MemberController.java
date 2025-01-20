package com.moneytree_back.login.controller;

import com.moneytree_back.login.domain.Member;
import com.moneytree_back.login.dto.MemberDTO;
import com.moneytree_back.login.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /**
     * 회원가입
     */
    @PostMapping
    public ResponseEntity<Member> createMember(@RequestBody MemberDTO memberDTO) {
        Member createdMember = memberService.createMember(memberDTO);
        return ResponseEntity.ok(createdMember);
    }
}

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

    // 기본 경로에서 회원가입 처리
    @PostMapping
    public ResponseEntity<Member> createMemberDefault(@RequestBody MemberDTO memberDTO) {
        Member newMember = memberService.createMember(memberDTO);
        return ResponseEntity.ok(newMember);
    }

    // 기존 회원가입 엔드포인트 (필요하면 유지)
    @PostMapping("/make")
    public ResponseEntity<Member> createMember(@RequestBody MemberDTO memberDTO) {
        Member newMember = memberService.createMember(memberDTO);
        return ResponseEntity.ok(newMember);
    }

    // 기타 API 엔드포인트
    @PostMapping("/login")
    public ResponseEntity<Member> login(@RequestBody MemberDTO loginDTO) {
        Member member = memberService.login(loginDTO);
        return ResponseEntity.ok(member);
    }

    @PutMapping("/modify/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable String  id, @RequestBody MemberDTO memberDTO) {
        Member updatedMember = memberService.modifyMember(id, memberDTO);
        return ResponseEntity.ok(updatedMember);
    }

}

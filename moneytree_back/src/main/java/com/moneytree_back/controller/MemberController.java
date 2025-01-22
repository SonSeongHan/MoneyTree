package com.moneytree_back.controller;

import com.moneytree_back.domain.Member;
import com.moneytree_back.dto.MemberDTO;
import com.moneytree_back.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody MemberDTO loginDTO) {
        try {
            Member member = memberService.login(loginDTO);
            return ResponseEntity.ok(member);
        } catch (IllegalArgumentException e) {
            // 검증 실패나 로그인 정보 불일치 시 -> 400 응답 + 메시지
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            // 기타 예외
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/modify/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable String id, @RequestBody MemberDTO memberDTO) {
        Member updatedMember = memberService.modifyMember(id, memberDTO);
        return ResponseEntity.ok(updatedMember);
    }
}

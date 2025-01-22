package com.moneytree_back.controller;

import com.moneytree_back.domain.Member;
import com.moneytree_back.dto.MemberDTO;
import com.moneytree_back.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // 회원가입
    @PostMapping("/make")
    public ResponseEntity<Member> createMember(@RequestBody MemberDTO memberDTO) {
        Member newMember = memberService.createMember(memberDTO);
        return ResponseEntity.ok(newMember);
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody MemberDTO loginDTO) {
        try {
            // 로그인 요청을 서비스에 위임
            Member member = memberService.login(loginDTO);

            // 로그인 성공 시 사용자 정보 반환
            return ResponseEntity.ok(Map.of(
                    "member_id", member.getMemberId(),
                    "residentRegistrationNumber", member.getResidentRegistrationNumber(),
                    "member_password", member.getMemberpassword()
            ));
        } catch (IllegalArgumentException e) {
            // 검증 실패나 로그인 정보 불일치 시
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // 기타 예외 처리
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "로그인 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    // 회원 정보 수정
    @PutMapping("/modify/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable String id, @RequestBody MemberDTO memberDTO) {
        Member updatedMember = memberService.modifyMember(id, memberDTO);
        return ResponseEntity.ok(updatedMember);
    }
}

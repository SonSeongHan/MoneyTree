        package com.moneytree_back.controller;

        import com.moneytree_back.domain.Member;
        import com.moneytree_back.dto.MemberDTO;
        import com.moneytree_back.dto.ReactivateRequestDTO;
        import com.moneytree_back.service.MemberService;
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
        //    @PostMapping("/login")
        //    public ResponseEntity<Member> login(@RequestBody MemberDTO loginDTO) {
        //        Member member = memberService.login(loginDTO);
        //        return ResponseEntity.ok(member);
        //    }

            @PutMapping("/modify/{id}")
            public ResponseEntity<Member> updateMember(@PathVariable String id, @RequestBody MemberDTO memberDTO) {
                Member updatedMember = memberService.modifyMember(id, memberDTO);
                return ResponseEntity.ok(updatedMember);
            }

            // 비밀번호 변경 API 추가
            @PostMapping("/changePassword")
            public ResponseEntity<String> changePassword(@RequestBody MemberDTO memberDTO) {
                try {
                    memberService.changePassword(
                            memberDTO.getMemberId(),
                            memberDTO.getMemberpassword(), // 기존 비밀번호
                            memberDTO.getAccountNumber()  // 새 비밀번호 (accountNumber 필드 사용)
                    );
                    return ResponseEntity.ok("비밀번호 변경 성공");
                } catch (IllegalArgumentException e) {
                    if (e.getMessage().equals("현재 비밀번호가 일치하지 않습니다.")) {
                        return ResponseEntity.status(401).body("현재 비밀번호가 일치하지 않습니다.");
                    }
                    return ResponseEntity.badRequest().body(e.getMessage());
                }
            }


            @PostMapping("/changeName")
            public ResponseEntity<String> changeMemberName(@RequestBody MemberDTO memberDTO) {
                if (memberDTO.getMemberId() == null || memberDTO.getMemberpassword() == null || memberDTO.getMember_name() == null) {
                    return ResponseEntity.badRequest().body("모든 필드를 입력해야 합니다.");
                }

                boolean success = memberService.changeMemberName(
                        memberDTO.getMemberId(),   // 기존 아이디
                        memberDTO.getMember_name(), // 변경할 이름
                        memberDTO.getMemberpassword() // 비밀번호
                );

                if (success) {
                    return ResponseEntity.ok("이름 변경 성공");
                } else {
                    return ResponseEntity.badRequest().body("이름 변경 실패");
                }
            }
            @DeleteMapping("/{memberId}/withdraw")
            public ResponseEntity<String> withdrawMember(
                    @PathVariable String memberId,
                    @RequestParam(value = "withdrawalReason", defaultValue = "사용자탈퇴") String withdrawalReason) {

                memberService.withdrawMember(memberId, withdrawalReason);
                return ResponseEntity.ok("회원 탈퇴 처리가 완료되었습니다.");
            }

            // 재활성화 API
            @PostMapping("/{memberId}/reactivate")
            public ResponseEntity<String> reactivateMember(
                    @PathVariable String memberId,
                    @RequestBody ReactivateRequestDTO request) {
                try {
                    memberService.reactivateMember(memberId, request.getPassword());
                    return ResponseEntity.ok("계정이 재활성화되었습니다.");
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(e.getMessage());
                }
            }

        }
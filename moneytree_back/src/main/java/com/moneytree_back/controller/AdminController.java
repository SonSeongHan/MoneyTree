package com.moneytree_back.controller;

import com.moneytree_back.domain.member.Member;
import com.moneytree_back.dto.member.MemberDetailDTO;
import com.moneytree_back.dto.TransferHistoryDTO;
import com.moneytree_back.service.member.MemberService;
import com.moneytree_back.service.TransactionHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Collections;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final MemberService memberService;
    private final TransactionHistoryService transactionHistoryService;

    // 기존 전체 회원 목록 조회 엔드포인트
    @GetMapping("/members")
    public ResponseEntity<List<Member>> getAllMembers() {
        List<Member> members = memberService.getAllMembers();
        return ResponseEntity.ok(members);
    }

    // 단일 회원의 상세 정보(송금 내역 포함)를 반환하는 엔드포인트
    @GetMapping("/members/{memberId}")
    public ResponseEntity<MemberDetailDTO> getMemberDetail(@PathVariable String memberId) {
        // (1) 회원 정보 조회
        Member member = memberService.getMemberById(memberId);

        // (2) memberId를 이용하여 송금 내역(거래 내역)을 조회 (예: 최근 6개월 간 내역)
        // 반환 타입을 TransactionHistory가 아니라 TransferHistoryDTO로 받아야 합니다.
        List<TransferHistoryDTO> histories = transactionHistoryService.getTransactionsForMember(memberId, 6);

        // (3) 필요한 경우, TransferHistoryDTO를 기반으로 추가 가공을 할 수 있습니다.
        // 예를 들어, DTO에 없는 필드를 보완하거나 다른 형식으로 변경할 수 있습니다.
        // 여기서는 이미 DTO로 필요한 정보가 들어있으므로 별도의 매핑이 필요없습니다.

        // (4) 회원 상세 DTO 생성 (가입 상품, 취미 등은 실제 데이터에 맞게 수정)
        MemberDetailDTO detailDTO = new MemberDetailDTO();
        detailDTO.setMemberId(member.getMemberId());
        detailDTO.setBalance(10000); // 예시 값
        detailDTO.setSubscribedProducts(Collections.emptyList());
        detailDTO.setHobbies(Collections.emptyList());
        detailDTO.setTransferHistory(histories);  // 이제 histories는 List<TransferHistoryDTO>입니다.

        return ResponseEntity.ok(detailDTO);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        // 404 Not Found를 반환하도록 설정
        return ResponseEntity.status(404).body(ex.getMessage());
    }
}

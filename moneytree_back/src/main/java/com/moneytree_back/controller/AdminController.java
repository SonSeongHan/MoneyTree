package com.moneytree_back.controller;

import com.moneytree_back.domain.Member;
import com.moneytree_back.domain.TransactionHistory;
import com.moneytree_back.dto.MemberDetailDTO;
import com.moneytree_back.dto.TransferHistoryDTO;
import com.moneytree_back.service.MemberService;
import com.moneytree_back.service.TransactionHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;

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
        List<TransactionHistory> histories = transactionHistoryService.getTransactionsForMember(memberId, 6);

        // (3) 조회된 TransactionHistory 엔티티를 TransferHistoryDTO로 변환
        List<TransferHistoryDTO> transferHistoryDTOs = histories.stream()
                .map(history -> TransferHistoryDTO.builder()
                        .id(history.getId())
                        .transactionType(history.getDandwacType().name())
                        .amount(history.getAmount().doubleValue())
                        .createdAt(history.getCreatedAt())
                        .fromMemberName(history.getFromAccount().getMember().getMemberName())
                        .toMemberName(history.getToAccount().getMember().getMemberName())
                        .build())
                .collect(Collectors.toList());

        // (4) 회원 상세 DTO 생성 (가입 상품, 취미 등은 실제 데이터에 맞게 수정)
        MemberDetailDTO detailDTO = new MemberDetailDTO();
        detailDTO.setMemberId(member.getMemberId());
        // 실제 잔액 정보는 회원의 계좌 정보를 통해 조회하는 것이 좋으나, 여기서는 예시로 10000으로 설정
        detailDTO.setBalance(10000);
        detailDTO.setSubscribedProducts(Collections.emptyList());
        detailDTO.setHobbies(Collections.emptyList());
        detailDTO.setTransferHistory(transferHistoryDTOs);

        return ResponseEntity.ok(detailDTO);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        // 404 Not Found를 반환하도록 설정
        return ResponseEntity.status(404).body(ex.getMessage());
    }
}

package com.moneytree_back.controller;

import com.moneytree_back.dto.TransferHistoryDTO;
import com.moneytree_back.service.TransactionHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionHistoryController {

    private final TransactionHistoryService transactionHistoryService;

    public TransactionHistoryController(TransactionHistoryService transactionHistoryService) {
        this.transactionHistoryService = transactionHistoryService;
    }

    /**
     * 주어진 회원의 입출금 계좌에 대한 거래 내역을 최근 'months' 개월 간 조회합니다.
     *
     * @param memberId 회원 식별자
     * @param months   조회할 기간(개월 수), 기본값은 1개월
     * @return 거래 내역 리스트
     */
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<TransferHistoryDTO>> getTransactionsForMember(
            @PathVariable String memberId,
            @RequestParam(defaultValue = "1") int months,
            @RequestParam(required = false) String membershipType) {
        // membershipType을 사용한 추가 로직 구현 가능
        List<TransferHistoryDTO> transactions = transactionHistoryService.getTransactionsForMember(memberId, months);
        return ResponseEntity.ok(transactions);
    }


}

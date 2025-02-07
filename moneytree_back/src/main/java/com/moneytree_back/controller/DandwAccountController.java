package com.moneytree_back.controller;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.TransactionHistory;
import com.moneytree_back.dto.DandwacDTO;
import com.moneytree_back.dto.TransferRequestDTO;
import com.moneytree_back.service.DandwacService;
import com.moneytree_back.service.TransactionHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class DandwAccountController {

    private final DandwacService dandwacService;
    private final TransactionHistoryService transactionHistoryService;

    // (1) 계좌 생성
    @PostMapping
    public ResponseEntity<?> createAccount(@RequestBody DandwacDTO dto) {
        try {
            Dandwac created = dandwacService.createAccount(dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // (2) 계좌 조회
    @GetMapping("/{dandwAcId}")
    public ResponseEntity<?> getAccount(@PathVariable String dandwAcId) {
        try {
            Dandwac account = dandwacService.getAccount(dandwAcId);
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // (3) 계좌 주인 이름 확인 (receiverAccountId 입력받아서 이름 반환)
    @GetMapping("/ownerName")
    public ResponseEntity<?> getOwnerName(@RequestParam String accountId) {
        try {
            Dandwac dandwac = dandwacService.getAccount(accountId);
            String ownerName = dandwac.getMember().getMember_name();
            return ResponseEntity.ok(ownerName);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // (4) 송금 (내 계좌 → receiverAccountId)
    @PostMapping("/transfer")
    public ResponseEntity<?> transferMoney(@Valid @RequestBody TransferRequestDTO dto) {
        try {
            // dto 안에 senderMemberId(로그인 사용자)가 포함되어 있다고 가정합니다.
            // (프론트에서 쿠키 등으로 memberId를 꺼내 request body에 포함)
            dandwacService.transferMoney(
                    dto.getSenderMemberId(),
                    dto.getReceiverAccountId(),
                    dto.getAmount(),
                    dto.getPassword()
            );
            return ResponseEntity.ok("송금 완료");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // (5) 거래 내역 조회
    // member_id에 해당하는 입출금 계좌의 송금/출금 내역을, 현재 시각 기준 지난 'months' 개월 이내의 내역으로 필터링하여 조회
    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactionHistory(@RequestParam String memberId,
                                                   @RequestParam(defaultValue = "1") int months) {
        try {
            List<TransactionHistory> transactions =
                    transactionHistoryService.getTransactionsForMember(memberId, months);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
}

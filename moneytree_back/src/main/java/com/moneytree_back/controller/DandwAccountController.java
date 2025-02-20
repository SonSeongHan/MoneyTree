package com.moneytree_back.controller;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.TransactionHistory;
import com.moneytree_back.dto.DandwacDTO;
import com.moneytree_back.dto.DepositRequestDTO;
import com.moneytree_back.dto.TransferHistoryDTO;
import com.moneytree_back.dto.TransferRequestDTO;
import com.moneytree_back.service.dandwac.DandwacService;
import com.moneytree_back.service.TransactionHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

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

    // (3) 계좌 주인 이름 확인
    @GetMapping("/ownerName")
    public ResponseEntity<?> getOwnerName(@RequestParam String accountId) {
        try {
            Dandwac dandwac = dandwacService.getAccount(accountId);
            String ownerName = dandwac.getMember().getMemberName();
            return ResponseEntity.ok(ownerName);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // (4) 송금
    @PostMapping("/transfer")
    public ResponseEntity<?> transferMoney(@Valid @RequestBody TransferRequestDTO dto) {
        try {
            // dto.getFromMemberName()를 굳이 안 써도 되지만, 시그니처상 넣음
            dandwacService.transferMoney(
                    dto.getSenderMemberId(),
                    dto.getReceiverAccountId(),
                    dto.getAmount(),
                    dto.getPassword(),
                    dto.getDepositPurpose(),
                    dto.getFromMemberName(), // 프론트에서 온 값 (무시할 수도 있음)
                    dto.getToMemberName()
            );
            return ResponseEntity.ok("송금 완료");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactionHistory(@RequestParam String memberId,
                                                   @RequestParam(defaultValue = "1") int months) {
        try {
            // 서비스에서 이미 TransferHistoryDTO 리스트를 반환하므로 타입을 맞춰줍니다.
            List<TransferHistoryDTO> transactions =
                    transactionHistoryService.getTransactionsForMember(memberId, months);

            // 만약 추가로 DTO를 가공할 필요가 없다면, 아래 mapping 과정은 생략하고 바로 transactions를 반환해도 됩니다.
            List<TransferHistoryDTO> dtos = transactions.stream().map(tx -> {
                // DB에 저장된 닉네임 필드를 그대로 사용
                String fromName = tx.getFromMemberName();
                String toName = tx.getToMemberName();

                return TransferHistoryDTO.builder()
                        .id(tx.getId())
                        .transactionType(tx.getTransactionType())  // 이미 DTO에 세팅되어 있음
                        .amount(tx.getAmount())
                        .createdAt(tx.getCreatedAt())
                        .fromMemberName(fromName)
                        .toMemberName(toName)
                        .build();
            }).collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }


    // (6) 충전(입금)
    @PostMapping("/deposit")
    public ResponseEntity<?> depositMoney(@Valid @RequestBody DepositRequestDTO dto) {
        try {
            dandwacService.depositMoney(
                    dto.getMemberId(),
                    dto.getPassword(),
                    dto.getAmount(),
                    dto.getDepositPurpose()
            );
            return ResponseEntity.ok("충전 완료");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // 계좌 번호 조회 (02.17 손성한)
    @GetMapping("/account-number/{memberId}")
    public ResponseEntity<String> getDandwacAccountNumber(@PathVariable String memberId) {
        try {
            String accountNumber = dandwacService.getDandwacAccountNumberByMemberId(memberId);
            return ResponseEntity.ok(accountNumber);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // 계좌 잔액 조회 (02.17 손성한)
    @GetMapping("/balance/{dandwAcId}")
    public ResponseEntity<BigDecimal> getDandwacBalance(@PathVariable String dandwAcId) {
        try {
            BigDecimal balance = dandwacService.getDandwacBalance(dandwAcId);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(BigDecimal.ZERO);
        }
    }
}

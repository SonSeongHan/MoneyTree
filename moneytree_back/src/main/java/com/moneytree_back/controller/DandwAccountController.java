package com.moneytree_back.controller;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.dto.DandwacDTO;
import com.moneytree_back.service.DandwacService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class DandwAccountController {

    private final DandwacService dandwacService;

    /**
     * 계좌 생성
     * POST /api/accounts
     */
    @PostMapping
    public ResponseEntity<?> createAccount(@RequestBody DandwacDTO dto) {
        try {
            Dandwac created = dandwacService.createAccount(dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * 계좌 조회 (예시)
     * GET /api/accounts/{dandwAcId}
     */
    @GetMapping("/{dandwAcId}")
    public ResponseEntity<?> getAccount(@PathVariable String dandwAcId) {
        try {
            Dandwac account = dandwacService.getAccount(dandwAcId);
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // 추가로 입금/출금/삭제 등 필요한 API 작성 가능
}

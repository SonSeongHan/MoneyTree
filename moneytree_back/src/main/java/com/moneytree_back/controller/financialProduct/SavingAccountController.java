package com.moneytree_back.controller.financialProduct;

import com.moneytree_back.dto.member.MemberDTO;
import com.moneytree_back.dto.financialProduct.SavingAccountDTO;
import com.moneytree_back.service.financialProduct.SavingAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/saving-accounts")
@Log4j2
public class SavingAccountController {

    private final SavingAccountService savingAccountService;

    // Principal에서 memberId를 안전하게 추출하는 private 메서드
    private String getMemberIdFromAuthentication(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal == null) {
            throw new RuntimeException("인증 정보를 찾을 수 없습니다.");
        }

        if (principal instanceof MemberDTO) {
            return ((MemberDTO) principal).getMemberId();
        } else if (principal instanceof Map) {
            return ((Map<String, String>) principal).get("memberId");
        } else if (principal instanceof String) {
            return (String) principal;
        }

        throw new RuntimeException("유효하지 않은 인증 정보입니다.");
    }

    // 적금 계좌 생성 (상품 가입)
    @PostMapping("/create")
    public ResponseEntity<?> createSavingAccount(@RequestBody Map<String, Object> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String memberId = getMemberIdFromAuthentication(authentication);

            SavingAccountDTO createdAccount = savingAccountService.createSavingAccount(request, memberId);

            return ResponseEntity.ok()
                    .body(Map.of(
                            "message", "적금 계좌가 성공적으로 생성되었습니다.",
                            "account", createdAccount
                    ));
        } catch (RuntimeException e) {
            log.error("Business Logic Error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected Error: ", e);
            return ResponseEntity.internalServerError().body("서버 내부 오류가 발생했습니다.");
        }
    }

    // 회원의 적금 계좌 목록 조회 (마이페이지용)
    @GetMapping("/my-accounts")
    public ResponseEntity<?> getMySavingAccounts() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String memberId = getMemberIdFromAuthentication(authentication);

            List<SavingAccountDTO> accounts = savingAccountService.getMySavingAccounts(memberId);

            return ResponseEntity.ok()
                    .body(Map.of(
                            "accounts", accounts,
                            "totalCount", accounts.size()
                    ));
        } catch (Exception e) {
            log.error("Error fetching saving accounts: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 해지
    @PostMapping("/{accountNumber}/terminate")
    public ResponseEntity<?> terminateSavingAccount(
            @PathVariable Long accountNumber,
            @RequestBody Map<String, String> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String memberId = getMemberIdFromAuthentication(authentication);

            Map<String, Object> result = savingAccountService.terminateSavingAccount(accountNumber, request.getOrDefault("reason", "중도해지"), memberId);

            return ResponseEntity.ok().body(result);
        } catch (Exception e) {
            log.error("Error terminating saving account: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
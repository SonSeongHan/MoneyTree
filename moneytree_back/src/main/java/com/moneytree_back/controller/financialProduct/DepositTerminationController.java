package com.moneytree_back.controller.financialProduct;

import com.moneytree_back.dto.financialProduct.DepositTerminationDTO;
import com.moneytree_back.service.financialProduct.DepositTerminationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/deposit-terminations")
@RequiredArgsConstructor
public class DepositTerminationController {

    private final DepositTerminationServiceImpl depositTerminationService;

    // 로그인한 회원의 해지된 예금 계좌 목록 조회
    @GetMapping("/my-terminations")
    public ResponseEntity<?> getMyTerminations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String memberId = authentication.getName();

        List<DepositTerminationDTO> terminations = depositTerminationService.findTerminationsByMemberId(memberId);
        return ResponseEntity.ok().body(terminations);
    }

    // 특정 예금 계좌의 해지 내역 조회
    @GetMapping("/{depositAccountNumber}")
    public ResponseEntity<?> getTerminationByAccountNumber(@PathVariable Long depositAccountNumber) {
        DepositTerminationDTO termination = depositTerminationService.findByDepositAccountNumber(depositAccountNumber);
        return ResponseEntity.ok().body(termination);
    }

    // 전체 해지 내역 조회 (관리자용)
    @GetMapping("/all")
    public ResponseEntity<?> getAllTerminations() {
        List<DepositTerminationDTO> allTerminations = depositTerminationService.findAllTerminations();
        return ResponseEntity.ok().body(allTerminations);
    }
}

package com.moneytree_back.controller.financialProduct;

import com.moneytree_back.dto.financialProduct.SavingTerminationDTO;
import com.moneytree_back.service.financialProduct.SavingTerminationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/saving-terminations")
@RequiredArgsConstructor
public class SavingTerminationController {

    private final SavingTerminationServiceImpl savingTerminationService;

    // 로그인한 회원의 해지된 적금 계좌 목록 조회
    @GetMapping("/my-terminations")
    public ResponseEntity<?> getMyTerminations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String memberId = authentication.getName();

        List<SavingTerminationDTO> terminations = savingTerminationService.findTerminationsByMemberId(memberId);
        return ResponseEntity.ok().body(terminations);
    }

    // 특정 적금 계좌의 해지 내역 조회
    @GetMapping("/{savingAccountNumber}")
    public ResponseEntity<?> getTerminationByAccountNumber(@PathVariable Long savingAccountNumber) {
        SavingTerminationDTO termination = savingTerminationService.findBySavingAccountNumber(savingAccountNumber);
        return ResponseEntity.ok().body(termination);
    }

    // 전체 해지 내역 조회 (관리자용)
    @GetMapping("/all")
    public ResponseEntity<?> getAllTerminations() {
        List<SavingTerminationDTO> allTerminations = savingTerminationService.findAllTerminations();
        return ResponseEntity.ok().body(allTerminations);
    }
}
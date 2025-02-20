package com.moneytree_back.controller.financialProduct;

import com.moneytree_back.dto.financialProduct.StockAccountDTO;
import com.moneytree_back.dto.financialProduct.StockHoldingDTO;
import com.moneytree_back.dto.member.MemberDTO;
import com.moneytree_back.service.financialProduct.StockAccountService;
import com.moneytree_back.service.financialProduct.StockHoldingService;
import com.moneytree_back.service.dandwac.DandwacService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock-controller")
@RequiredArgsConstructor
public class StockController {

    private final StockAccountService stockAccountService;
    private final StockHoldingService stockHoldingService;
    private final DandwacService dandwacService;

    // 1. 주식 계좌 생성
//    @PostMapping("/account-create")
//    public ResponseEntity<StockAccountDTO> createStockAccount(@RequestParam String dandwAcId) {
//        StockAccountDTO account = stockAccountService.createStockAccount(dandwAcId);
//        return ResponseEntity.ok(account);
//    }

    @PostMapping("/account-create")
    public ResponseEntity<StockAccountDTO> createStockAccount(
            Authentication authentication) {
        // SecurityContext에서 memberId 추출
        String memberId = getMemberIdFromAuthentication(authentication);
        StockAccountDTO account = stockAccountService.createStockAccount(memberId);
        return ResponseEntity.ok(account);
    }

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

    // 2. 입출금 계좌에서 주식 계좌로 자금 이체
    @PostMapping("/dandwac-stock/deposit")
    public ResponseEntity<Void> depositToStockAccount(
            @RequestParam String dandwAcId,
            @RequestParam Long stockAccountNumber,
            @RequestParam BigDecimal amount) {
        dandwacService.transferToStockAccount(dandwAcId, stockAccountNumber, amount);
        System.out.println("✅ 요청받은 입출금 계좌 ID: " + dandwAcId);
        System.out.println("✅ 요청받은 주식 계좌 ID: " + stockAccountNumber);
        return ResponseEntity.ok().build();
    }

    // 3. 주식 계좌에서 입출금 계좌로 자금 이체
    @PostMapping("/stock-dandwac/withdraw")
    public ResponseEntity<Void> withdrawFromStockAccount(
            @RequestParam Long stockAccountNumber,
            @RequestParam String dandwAcId,
            @RequestParam BigDecimal amount) {
        stockAccountService.withdrawToDepositAccount(stockAccountNumber, dandwAcId, amount);
        return ResponseEntity.ok().build();
    }

    // 4. 주식 계좌 정보 조회
    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<StockAccountDTO> getStockAccount(@PathVariable String accountNumber) {
        StockAccountDTO account = stockAccountService.getStockAccountByDandwacId(accountNumber);
        return ResponseEntity.ok(account);
    }

    // 5. 주식 매수
    @PostMapping("/trade/buy")
    public ResponseEntity<StockHoldingDTO> buyStock(
            @RequestParam Long stockAccountNumber,
            @RequestParam Long stockProductId,
            @RequestParam Integer quantity,
            @RequestParam BigDecimal price) {
        StockHoldingDTO holding = stockHoldingService.buyStock(
                stockAccountNumber, stockProductId, quantity, price);
        return ResponseEntity.ok(holding);
    }

    // 6. 주식 매도
    @PostMapping("/trade/sell")
    public ResponseEntity<StockHoldingDTO> sellStock(
            @RequestParam Long stockAccountNumber,
            @RequestParam Long stockProductId,
            @RequestParam Integer quantity) {
        StockHoldingDTO holding = stockHoldingService.sellStock(
                stockAccountNumber, stockProductId, quantity);
        return ResponseEntity.ok(holding);
    }

    // 7. 보유 주식 목록 조회
    @GetMapping("/holdings/{accountNumber}")
    public ResponseEntity<List<StockHoldingDTO>> getStockHoldings(
            @PathVariable Long accountNumber) {
        List<StockHoldingDTO> holdings = stockHoldingService.getStockHoldingsByAccount(accountNumber);
        return ResponseEntity.ok(holdings);
    }
}
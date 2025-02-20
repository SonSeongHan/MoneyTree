package com.moneytree_back.controller.financialProduct;

import com.moneytree_back.dto.financialProduct.FundAccountDTO;
import com.moneytree_back.dto.financialProduct.FundProductDTO;
import com.moneytree_back.dto.member.MemberDTO;
import com.moneytree_back.service.financialProduct.FundAccountService;
import com.moneytree_back.service.dandwac.DandwacService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fund-account")
@RequiredArgsConstructor
public class FundAccountController {

    private final FundAccountService fundAccountService;
    private final DandwacService dandwacService;

    // 펀드 계좌 조회
    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<List<FundAccountDTO>> getFundAccounts(@PathVariable String accountNumber) {
        List<FundAccountDTO> fundAccounts = fundAccountService.getFundAccountsByDandwacId(accountNumber);
        return ResponseEntity.ok(fundAccounts);
    }

    @PostMapping("/account-create")
    public ResponseEntity<FundAccountDTO> createFundAccount(Authentication authentication) {
        String memberId = getMemberIdFromAuthentication(authentication);
        String dandwAcId = dandwacService.getDandwacAccountNumberByMemberId(memberId);

        // 로그 추가
        System.out.println("계좌 생성 요청 정보:");
        System.out.println("회원 ID: " + memberId);
        System.out.println("입출금 계좌 ID: " + dandwAcId);

        FundAccountDTO createdAccount = fundAccountService.createFundAccount(dandwAcId);

        // 응답 로그 추가
        System.out.println("생성된 계좌 정보:");
        System.out.println("계좌번호: " + createdAccount.getFundAccountNumber());
        System.out.println("계좌 상태: " + createdAccount.getFundStatus());

        return ResponseEntity.ok(createdAccount);
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

    // 펀드 상품 투자
    @PostMapping("/invest")
    public ResponseEntity<FundAccountDTO> investInFund(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        // 인증된 사용자의 입출금 계좌 ID 가져오기
        String memberId = getMemberIdFromAuthentication(authentication);
        String dandwAcId = dandwacService.getDandwacAccountNumberByMemberId(memberId);

        // 투자 요청 파라미터 추출
        Long fundProductId = Long.parseLong(request.get("fundProductId").toString());
        BigDecimal investmentAmount = new BigDecimal(request.get("investmentAmount").toString());

        // 입출금 계좌 ID와 펀드 상품 ID로 직접 투자
        FundAccountDTO updatedAccount = fundAccountService.investInFund(
                dandwAcId, fundProductId, investmentAmount);
        return ResponseEntity.ok(updatedAccount);
    }

    // 펀드 환매 가능 여부 확인
    @GetMapping("/redeem/check/{fundAccountNumber}")
    public ResponseEntity<Boolean> checkRedemptionEligibility(
            @PathVariable Long fundAccountNumber) {
        boolean isEligible = fundAccountService.checkRedemptionEligibility(fundAccountNumber);
        return ResponseEntity.ok(isEligible);
    }

    // 펀드 환매
    @PostMapping("/redeem")
    public ResponseEntity<FundAccountDTO> redeemFund(
            @RequestBody Map<String, Object> request) {
        Long fundAccountNumber = Long.parseLong(request.get("fundAccountNumber").toString());
        BigDecimal amount = new BigDecimal(request.get("amount").toString());

        FundAccountDTO updatedAccount = fundAccountService.redeemFund(fundAccountNumber, amount);
        return ResponseEntity.ok(updatedAccount);
    }

    // 가용 펀드 상품 목록 조회
    @GetMapping("/products")
    public ResponseEntity<List<FundProductDTO>> getAvailableFundProducts(
            @RequestParam(required = false) BigDecimal minTotalAmount,
            @RequestParam(required = false) BigDecimal maxTotalAmount,
            @RequestParam(required = false) BigDecimal maxManagementFee,
            @RequestParam(required = false) BigDecimal maxRedemptionFee,
            @RequestParam(required = false) LocalDate minMaturityDate) {

        List<FundProductDTO> products = fundAccountService.getAvailableFundProducts(
                minTotalAmount, maxTotalAmount, maxManagementFee,
                maxRedemptionFee, minMaturityDate);
        return ResponseEntity.ok(products);
    }

    // 예상 수익금 계산
    @GetMapping("/expected-profit/{fundAccountNumber}")
    public ResponseEntity<BigDecimal> calculateExpectedProfit(
            @PathVariable Long fundAccountNumber) {
        BigDecimal expectedProfit = fundAccountService.calculateExpectedProfit(fundAccountNumber);
        return ResponseEntity.ok(expectedProfit);
    }

    // 환매 금액 계산 (수수료 차감 후)
    @GetMapping("/redemption-amount")
    public ResponseEntity<BigDecimal> calculateRedemptionAmount(
            @RequestParam Long fundAccountNumber,
            @RequestParam BigDecimal amount) {
        BigDecimal redemptionAmount = fundAccountService.calculateRedemptionAmount(
                fundAccountNumber, amount);
        return ResponseEntity.ok(redemptionAmount);
    }

    // 펀드 상태 조회
    @GetMapping("/status/{fundAccountNumber}")
    public ResponseEntity<String> getFundStatus(@PathVariable Long fundAccountNumber) {
        String status = fundAccountService.getFundStatus(fundAccountNumber);
        return ResponseEntity.ok(status);
    }

    // 만기까지 남은 일수 조회
    @GetMapping("/remaining-days/{fundAccountNumber}")
    public ResponseEntity<Long> getRemainingDays(@PathVariable Long fundAccountNumber) {
        Long remainingDays = fundAccountService.getRemainingDays(fundAccountNumber);
        return ResponseEntity.ok(remainingDays);
    }
}
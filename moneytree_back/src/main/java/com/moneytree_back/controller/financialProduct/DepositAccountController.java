package com.moneytree_back.controller.financialProduct;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.dto.MemberDTO;
import com.moneytree_back.dto.financialProduct.DepositAccountDTO;
import com.moneytree_back.repository.DandwacRepository;
import com.moneytree_back.service.financialProduct.DepositAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/deposit-accounts")
@Log4j2
public class DepositAccountController {

    private final DepositAccountService depositAccountService;
    private final DandwacRepository dandwacRepository;

    // Principal에서 memberId를 안전하게 추출하는 private 메서드
    private String getMemberIdFromAuthentication(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal == null) {
            throw new RuntimeException("인증 정보를 찾을 수 없습니다.");
        }

        if (principal instanceof MemberDTO) {
            return ((MemberDTO) principal).getMemberId();  // ✅ MemberDTO에서 memberId 가져오기
        } else if (principal instanceof Map) {
            return ((Map<String, String>) principal).get("memberId");
        } else if (principal instanceof String) {
            return (String) principal;
        }

        throw new RuntimeException("유효하지 않은 인증 정보입니다.");
    }

    // 예금 계좌 생성 (상품 가입)
    @PostMapping("/create")
    public ResponseEntity<?> createDepositAccount(@RequestBody Map<String, Object> request) {
        try {
            // 현재 로그인한 사용자 정보 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            // memberId 추출
            String memberId;
            Object principal = authentication.getPrincipal();
            if (principal instanceof MemberDTO) {
                memberId = ((MemberDTO) principal).getMemberId();
            } else if (principal instanceof String) {
                memberId = (String) principal;
            } else {
                throw new RuntimeException("유효하지 않은 인증 정보입니다.");
            }

            if (memberId == null || memberId.isEmpty()) {
                return ResponseEntity.badRequest().body("회원 정보를 찾을 수 없습니다.");
            }

            // 입출금 계좌 조회
            Dandwac dandwac = dandwacRepository.findByMember_MemberId(memberId)
                    .orElseThrow(() -> new RuntimeException("입출금 계좌를 찾을 수 없습니다."));

            // 예금 금액 검증
            if (!request.containsKey("depositAmount") || request.get("depositAmount") == null) {
                return ResponseEntity.badRequest().body("예금 금액을 입력해주세요.");
            }

            // DTO 생성
            DepositAccountDTO depositAccountDTO = DepositAccountDTO.builder()
                    .depositAmount(new BigDecimal(request.get("depositAmount").toString()))
                    .depositProductId(Long.parseLong(request.get("depositProductId").toString()))
                    .dandwAcId(dandwac.getDandwAcId())  // 조회한 계좌번호 직접 사용
                    .isRegularPayment(request.get("isRegularPayment") != null &&
                            Boolean.parseBoolean(request.get("isRegularPayment").toString()))
                    .regularPaymentAmount(request.get("regularPaymentAmount") != null ?
                            new BigDecimal(request.get("regularPaymentAmount").toString()) : null)
                    .regularPaymentDay(request.get("regularPaymentDay") != null ?
                            Integer.parseInt(request.get("regularPaymentDay").toString()) : null)
                    .build();

            // 예금 계좌 생성
            DepositAccountDTO createdAccount = depositAccountService.createDepositAccount(depositAccountDTO);
            return ResponseEntity.ok()
                    .body(Map.of(
                            "message", "예금 계좌가 성공적으로 생성되었습니다.",
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


    // 회원의 예금 계좌 목록 조회 (마이페이지용)
    @GetMapping("/my-accounts")
    public ResponseEntity<?> getMyDepositAccounts() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

//            // 🔍 현재 SecurityContext에 설정된 Authentication 확인
//            log.info("🔍 현재 SecurityContext의 인증 정보: {}", authentication);
//            log.info("🔍 Principal: {}", authentication.getPrincipal());
//            log.info("🔍 Authorities: {}", authentication.getAuthorities());
//            log.info("🔍 Credentials: {}", authentication.getCredentials());

            String memberId = getMemberIdFromAuthentication(authentication);
//            log.info("Fetching deposit accounts for member: {}", memberId);

            Dandwac dandwac = dandwacRepository.findByMember_MemberId(memberId)
                    .orElseThrow(() -> new RuntimeException("입출금 계좌를 찾을 수 없습니다."));

            List<DepositAccountDTO> accounts = depositAccountService.getDepositAccountsByDandwAcId(dandwac);
            return ResponseEntity.ok()
                    .body(Map.of(
                            "accounts", accounts,
                            "totalCount", accounts.size()
                    ));

        } catch (Exception e) {
            log.error("Error fetching deposit accounts: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 계좌 해지
    @PostMapping("/{accountNumber}/terminate")
    public ResponseEntity<?> terminateDepositAccount(
            @PathVariable Long accountNumber,
            @RequestBody Map<String, String> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String memberId = getMemberIdFromAuthentication(authentication);

            log.info("Terminating deposit account: {} for member: {}", accountNumber, memberId);

            // 입출금계좌 조회
            Dandwac dandwac = dandwacRepository.findByMember_MemberId(memberId)
                    .orElseThrow(() -> new RuntimeException("입출금 계좌를 찾을 수 없습니다."));

            // 해당 입출금계좌의 예금계좌들 조회
            List<DepositAccountDTO> accounts = depositAccountService.getDepositAccountsByDandwAcId(dandwac);

            // 해당 계좌번호를 가진 예금계좌가 있는지 확인
            boolean hasAccount = accounts.stream()
                    .anyMatch(acc -> acc.getDepositAccountNumber().equals(accountNumber));

            if (!hasAccount) {
                return ResponseEntity.badRequest().body("해당 계좌를 찾을 수 없거나 본인의 계좌가 아닙니다.");
            }

            String reason = request.getOrDefault("reason", "중도해지");
            BigDecimal currentInterest = depositAccountService.calculateDepositInterest(accountNumber);

            depositAccountService.terminateDepositAccount(accountNumber, reason, BigDecimal.ZERO);

            return ResponseEntity.ok()
                    .body(Map.of(
                            "message", "계좌가 성공적으로 해지되었습니다.",
                            "interestEarned", currentInterest
                    ));

        } catch (Exception e) {
            log.error("Error terminating deposit account: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 정기 납입 설정
    @PostMapping("/{accountNumber}/regular-payment")
    public ResponseEntity<?> setRegularPayment(
            @PathVariable Long accountNumber,
            @RequestBody Map<String, Object> request) {
        try {
            if (request.get("regularAmount") == null || request.get("paymentDay") == null) {
                return ResponseEntity.badRequest().body("정기 납입액과 납입일을 모두 입력해주세요.");
            }

            BigDecimal regularAmount = new BigDecimal(request.get("regularAmount").toString());
            Integer paymentDay = Integer.parseInt(request.get("paymentDay").toString());

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String memberId = getMemberIdFromAuthentication(authentication);

            log.info("Setting regular payment for account: {}", accountNumber);

            depositAccountService.setRegularPayment(accountNumber, regularAmount, paymentDay);
            return ResponseEntity.ok().body("정기 납입이 성공적으로 설정되었습니다.");

        } catch (Exception e) {
            log.error("Error setting regular payment: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 정기 납입 해제
    @DeleteMapping("/{accountNumber}/regular-payment")
    public ResponseEntity<?> cancelRegularPayment(@PathVariable Long accountNumber) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String memberId = getMemberIdFromAuthentication(authentication);

            log.info("Canceling regular payment for account: {}", accountNumber);

            depositAccountService.cancelRegularPayment(accountNumber);
            return ResponseEntity.ok().body("정기 납입이 성공적으로 해제되었습니다.");

        } catch (Exception e) {
            log.error("Error canceling regular payment: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

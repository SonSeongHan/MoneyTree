package com.moneytree_back.controller;

import com.moneytree_back.domain.member.Member;
import com.moneytree_back.dto.ApartmentTransactionDTO;
import com.moneytree_back.dto.ApartmentTransactionRequestDTO;
import com.moneytree_back.repository.MemberRepository;
import com.moneytree_back.service.ApartmentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller  // Thymeleaf 템플릿 렌더링을 위한 @Controller 사용
@RequestMapping("/api/apartment-transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000",
        allowedHeaders = {"Content-Type", "Authorization", "memberId", "memberid"},
        allowCredentials = "true")
public class ApartmentTransactionController {

  private final ApartmentTransactionService transactionService;
  private final com.moneytree_back.service.dandwac.DandwacService dandwacService;
  private final MemberRepository memberRepository; // Member 엔티티 검증용

  // 거래 생성 엔드포인트 (JSON 반환)
  @PostMapping
  @ResponseBody
  public ApartmentTransactionDTO createTransaction(@RequestBody ApartmentTransactionRequestDTO request) {
    ApartmentTransactionDTO dto = transactionService.createTransaction(
            request.getBuyerId(),
            request.getSellerId(),
            request.getApartmentName(),
            request.getPrice(),
            request.getRemarks());
    return dto;
  }

  // 거래 조회 엔드포인트 (JSON 반환)
  @GetMapping("/{id}")
  @ResponseBody
  public ApartmentTransactionDTO getTransaction(@PathVariable Long id) {
    return transactionService.getTransaction(id);
  }

  // 매수자별 거래 내역 조회 (JSON 반환)
  @GetMapping("/buyer/{buyerId}")
  @ResponseBody
  public List<ApartmentTransactionDTO> getTransactionsByBuyer(@PathVariable String buyerId) {
    return transactionService.getTransactionsByBuyer(buyerId);
  }

  // 매도자별 거래 내역 조회 (JSON 반환)
  @GetMapping("/seller/{sellerId}")
  @ResponseBody
  public List<ApartmentTransactionDTO> getTransactionsBySeller(@PathVariable String sellerId) {
    return transactionService.getTransactionsBySeller(sellerId);
  }

  // HTML 인증 문서 반환 (매수자용)
  @GetMapping("/buyer-auth-html/{transactionId}")
  public String getBuyerAuthHtml(@RequestParam("memberId") String memberId,
                                 @PathVariable Long transactionId,
                                 Model model) {
    ApartmentTransactionDTO transaction = transactionService.getTransaction(transactionId);
    if (!transaction.getBuyerId().equals(memberId)) {
      throw new RuntimeException("매수자만 인증 문서를 생성할 수 있습니다.");
    }
    model.addAttribute("transaction", transaction);
    return "/buyer-auth";  // src/main/resources/templates/buyer-auth.html
  }

  // HTML 인증 문서 반환 (매도자용)
// HTML 인증 문서 반환 (매도자용)
  @GetMapping("/seller-auth-html/{transactionId}")
  public String getSellerAuthHtml(@RequestParam("memberId") String memberId,
                                  @PathVariable Long transactionId,
                                  Model model) {
    ApartmentTransactionDTO transaction = transactionService.getTransaction(transactionId);
    if (!transaction.getSellerId().equals(memberId)) {
      throw new RuntimeException("매도자만 인증 문서를 생성할 수 있습니다.");
    }
    model.addAttribute("transaction", transaction);
    return "seller-auth";  // 단순 뷰 이름 반환 (앞에 슬래시 없음)
  }



  // 매도자 인증문서 절대경로 추가중.
  @Configuration
  public class MvcConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
      registry.addViewController("/seller-auth-view").setViewName("seller-auth");
    }
  }



  // 서명(동의) 완료 엔드포인트 (JSON 반환)
  @PostMapping("/consent/{transactionId}")
  @ResponseBody
  public void consentTransaction(@RequestHeader("memberId") String memberId,
                                 @PathVariable Long transactionId) {
    transactionService.consentTransaction(memberId, transactionId);
  }

  // 거래 문서(최종 계약서) 생성 및 반환 엔드포인트 (PDF 반환)
  @GetMapping("/complete/{transactionId}/document")
  @ResponseBody
  public ByteArrayResource getTransactionDocument(@RequestHeader("memberId,memberid") String memberId,
                                                  @PathVariable Long transactionId) {
    return transactionService.generateTransactionDocument(memberId, transactionId);
  }

  // 거래 수락(완료) 엔드포인트 (JSON 반환)
  @PutMapping("/complete/{transactionId}")
  @ResponseBody
  public ApartmentTransactionDTO completeTransaction(@RequestHeader("memberId, memberid") String memberId,
                                                     @PathVariable Long transactionId) {
    return transactionService.completeTransaction(memberId, transactionId);
  }

  // 거래 취소 엔드포인트 (JSON 반환)
  @DeleteMapping("/{transactionId}")
  @ResponseBody
  public String cancelTransaction(@RequestHeader("memberId") String memberId,
                                  @PathVariable Long transactionId) {
    transactionService.cancelTransaction(memberId, transactionId);
    return "거래가 취소되었습니다.";
  }

  // 계좌 잔액 조회 엔드포인트 (JSON 반환)
  @GetMapping("/account-balance")
  @ResponseBody
  public Map<String, Object> getAccountBalance(@RequestHeader("memberId") String memberId) {
    var account = dandwacService.findAccountByMemberId(memberId);
    Map<String, Object> response = new HashMap<>();
    response.put("dandwAcId", account.getDandwAcId());
    response.put("balance", account.getBalance());
    return response;
  }

  // 매도 인증 문서 제출 엔드포인트 (매도자가 자신의 인증 문서를 제출하면 거래가 완료됨)
  @PostMapping("/submit-seller-auth")
  @ResponseBody
  public ResponseEntity<?> submitSellerAuth(
          @RequestParam("transactionId") Long transactionId,
          @RequestParam("memberId") String memberId,         // 숨김 필드의 매도자 ID (실제 거래 대상)
          @RequestParam("sellerIdInput") String sellerIdInput, // 사용자가 직접 입력한 매도자 ID
          @RequestParam("password") String password,
          @RequestParam("signature") String signature,
          @RequestParam(value = "comments", required = false) String comments) {

    try {
      // 입력한 매도자 ID와 숨김 필드의 매도자 ID가 일치하는지 확인
      if (!memberId.equals(sellerIdInput)) {
        return ResponseEntity.badRequest().body("매도자 ID가 일치하지 않습니다.");
      }

      // 매도자 ID 검증: 입력한 memberId가 실제 존재하는지 확인
      Member member = memberRepository.findById(memberId).orElse(null);
      if (member == null) {
        return ResponseEntity.badRequest().body("해당 회원이 존재하지 않습니다.");
      }

      // 비밀번호 검증 (실제 운영 시 암호화된 비밀번호 비교 필요)
      if (!member.getMemberpassword().equals(password)) {
        return ResponseEntity.badRequest().body("비밀번호가 일치하지 않습니다.");
      }

      // ID와 비밀번호가 모두 맞을 경우, 서명 완료 처리
      boolean isCompleted = transactionService.submitSellerAuth(transactionId, memberId, signature, comments);
      if (isCompleted) {
        return ResponseEntity.ok("매도 인증이 완료되어 거래가 완료되었습니다.");
      } else {
        return ResponseEntity.badRequest().body("매도 인증 데이터 처리에 실패했습니다.");
      }
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

}


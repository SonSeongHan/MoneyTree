package com.moneytree_back.controller;

import com.moneytree_back.dto.MortgageLoanProductDTO;
import com.moneytree_back.service.MortgageLoanProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fss")
@RequiredArgsConstructor
public class MortgageLoanProductController {

  private final MortgageLoanProductService mortgageLoanProductService;

  @GetMapping("/mortgage-loan-products")
  public ResponseEntity<List<MortgageLoanProductDTO>> getMortgageLoanProducts(
    @RequestHeader("memberId") String memberId) {
    List<MortgageLoanProductDTO> products = mortgageLoanProductService.getMortgageLoanProductsForMember(memberId);
    return ResponseEntity.ok(products);
  }

  @GetMapping("/mortgage-loan-products/{id}")
  public ResponseEntity<MortgageLoanProductDTO> getMortgageLoanProductById(
    @PathVariable Long id,
    @RequestHeader("memberId") String memberId) {
    MortgageLoanProductDTO product = mortgageLoanProductService.getMortgageLoanProductByIdForMember(id, memberId);
    return ResponseEntity.ok(product);
  }

  @PostMapping("/mortgage-loan-products/{id}/subscribe")
  public ResponseEntity<String> subscribeMortgageLoanProduct(
    @PathVariable Long id,
    @RequestHeader("memberId") String memberId,
    @RequestBody(required = false) Map<String, Object> payload) {

    Number loanAmountNumber = (Number) payload.get("loanAmount");
    if (loanAmountNumber == null || loanAmountNumber.longValue() <= 0) {
      return ResponseEntity.badRequest().body("loanAmount 값이 필요하며, 0보다 커야 합니다.");
    }
    long loanAmount = loanAmountNumber.longValue();

    try {
      mortgageLoanProductService.subscribeMortgageLoanProduct(id, memberId, loanAmount);
    } catch (IllegalArgumentException ex) {
      return ResponseEntity.badRequest().body(ex.getMessage());
    }

    String message = String.format("구독 완료. 회원 '%s'은 이 상품 가입 시 최대 %s 대출 가능합니다.",
      memberId, loanAmount);
    return ResponseEntity.ok(message);
  }


}

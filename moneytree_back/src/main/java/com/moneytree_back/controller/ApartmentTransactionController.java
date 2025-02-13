package com.moneytree_back.controller;

import com.moneytree_back.dto.ApartmentTransactionDTO;
import com.moneytree_back.service.ApartmentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartment-transactions")
@RequiredArgsConstructor
public class ApartmentTransactionController {

  private final ApartmentTransactionService transactionService;

  @PostMapping
  public ResponseEntity<ApartmentTransactionDTO> createTransaction(
    @RequestParam String buyerId,
    @RequestParam String sellerId,
    @RequestParam String apartmentName,
    @RequestParam Integer price,
    @RequestParam(required = false) String remarks) {
    ApartmentTransactionDTO dto = transactionService.createTransaction(buyerId, sellerId, apartmentName, price, remarks);
    return ResponseEntity.ok(dto);
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApartmentTransactionDTO> getTransaction(@PathVariable Long id) {
    ApartmentTransactionDTO dto = transactionService.getTransaction(id);
    return ResponseEntity.ok(dto);
  }

  @GetMapping("/buyer/{buyerId}")
  public ResponseEntity<List<ApartmentTransactionDTO>> getTransactionsByBuyer(@PathVariable String buyerId) {
    List<ApartmentTransactionDTO> list = transactionService.getTransactionsByBuyer(buyerId);
    return ResponseEntity.ok(list);
  }

  @GetMapping("/seller/{sellerId}")
  public ResponseEntity<List<ApartmentTransactionDTO>> getTransactionsBySeller(@PathVariable String sellerId) {
    List<ApartmentTransactionDTO> list = transactionService.getTransactionsBySeller(sellerId);
    return ResponseEntity.ok(list);
  }

  // 서명(동의) 완료 엔드포인트
  @PostMapping("/consent/{transactionId}")
  public ResponseEntity<Void> consentTransaction(
    @RequestHeader("memberId") String memberId,
    @PathVariable Long transactionId) {
    transactionService.consentTransaction(memberId, transactionId);
    return ResponseEntity.ok().build();
  }

  // 거래 문서(양식서) 생성 및 반환 엔드포인트
  @GetMapping("/complete/{transactionId}/document")
  public ResponseEntity<ByteArrayResource> getTransactionDocument(
    @RequestHeader("memberId") String memberId,
    @PathVariable Long transactionId) {
    ByteArrayResource resource = transactionService.generateTransactionDocument(memberId, transactionId);
    return ResponseEntity.ok()
      .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transaction_document.pdf")
      .contentType(MediaType.APPLICATION_PDF)
      .contentLength(resource.contentLength())
      .body(resource);
  }

  // 거래 수락(완료) 엔드포인트 추가
  @PutMapping("/complete/{transactionId}")
  public ResponseEntity<ApartmentTransactionDTO> completeTransaction(
    @RequestHeader("memberId") String memberId,
    @PathVariable Long transactionId) {
    ApartmentTransactionDTO dto = transactionService.completeTransaction(memberId, transactionId);
    return ResponseEntity.ok(dto);
  }

  // 거래 취소 엔드포인트 (하드 삭제)
  @DeleteMapping("/{transactionId}")
  public ResponseEntity<String> cancelTransaction(
    @RequestHeader("memberId") String memberId,
    @PathVariable Long transactionId) {
    transactionService.cancelTransaction(memberId, transactionId);
    return ResponseEntity.ok("거래 취소되었습니다.");
  }
}

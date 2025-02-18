package com.moneytree_back.service;

import com.moneytree_back.dto.ApartmentTransactionDTO;
import org.springframework.core.io.ByteArrayResource;
import java.util.List;

public interface ApartmentTransactionService {

  ApartmentTransactionDTO createTransaction(String buyerId, String sellerId, String apartmentName, Integer price, String remarks);

  ApartmentTransactionDTO getTransaction(Long id);

  List<ApartmentTransactionDTO> getTransactionsByBuyer(String buyerId);

  List<ApartmentTransactionDTO> getTransactionsBySeller(String sellerId);

  // [추가] 서명(동의) 처리 메서드
  void consentTransaction(String memberId, Long transactionId);

  // [추가] 거래 문서 생성 메서드
  ByteArrayResource generateTransactionDocument(String memberId, Long transactionId);

  // [추가] 거래 취소 메서드
  void cancelTransaction(String memberId, Long transactionId);
  // 거래 완료 메서드
  ApartmentTransactionDTO completeTransaction(String memberId, Long transactionId);
}

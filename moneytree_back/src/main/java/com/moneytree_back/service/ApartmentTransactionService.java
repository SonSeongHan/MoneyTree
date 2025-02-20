package com.moneytree_back.service;

import com.moneytree_back.dto.ApartmentTransactionDTO;
import org.springframework.core.io.ByteArrayResource;
import java.util.List;

public interface ApartmentTransactionService {
  ApartmentTransactionDTO createTransaction(String buyerId, String sellerId, String apartmentName, Integer price, String remarks);
  ApartmentTransactionDTO getTransaction(Long id);
  List<ApartmentTransactionDTO> getTransactionsByBuyer(String buyerId);
  List<ApartmentTransactionDTO> getTransactionsBySeller(String sellerId);
  void consentTransaction(String memberId, Long transactionId);
  ByteArrayResource generateTransactionDocument(String memberId, Long transactionId);
  void cancelTransaction(String memberId, Long transactionId);
  ApartmentTransactionDTO completeTransaction(String memberId, Long transactionId);

  // 매도 인증 제출 메서드 추가
  boolean submitSellerAuth(Long transactionId, String memberId, String signature, String comments);
}

package com.moneytree_back.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.moneytree_back.domain.ApartmentTransaction;
import com.moneytree_back.domain.member.Member;
import com.moneytree_back.dto.ApartmentTransactionDTO;
import com.moneytree_back.repository.ApartmentTransactionRepository;
import com.moneytree_back.repository.MemberRepository;
import com.moneytree_back.repository.ApartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApartmentTransactionServiceImpl implements ApartmentTransactionService {

  private final ApartmentTransactionRepository transactionRepository;
  private final MemberRepository memberRepository;
  private final ApartmentRepository apartmentRepository;

  @Override
  @Transactional
  public ApartmentTransactionDTO createTransaction(String buyerId, String sellerId, String apartmentName, Integer price, String remarks) {
    Member seller = memberRepository.findById(sellerId)
      .orElseThrow(() -> new RuntimeException("매도자가 존재하지 않습니다."));
    Member buyer = memberRepository.findById(buyerId)
      .orElseThrow(() -> new RuntimeException("매수자가 존재하지 않습니다."));
    var apartment = apartmentRepository.findByName(apartmentName)
      .orElseThrow(() -> new RuntimeException("아파트를 찾을 수 없습니다."));

    ApartmentTransaction transaction = ApartmentTransaction.builder()
      .buyer(buyer)
      .seller(seller)
      .apartment(apartment)
      .price(price)
      .transactionDate(LocalDateTime.now())
      .remarks(remarks)
      .consentGiven(false)
      .status("PENDING")
      .build();

    ApartmentTransaction savedTransaction = transactionRepository.save(transaction);
    return convertToDto(savedTransaction);
  }

  @Override
  public ApartmentTransactionDTO getTransaction(Long id) {
    ApartmentTransaction transaction = transactionRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));
    return convertToDto(transaction);
  }

  @Override
  public List<ApartmentTransactionDTO> getTransactionsByBuyer(String buyerId) {
    List<ApartmentTransaction> transactions = transactionRepository.findByBuyer_MemberId(buyerId);
    return transactions.stream()
      .map(this::convertToDto)
      .collect(Collectors.toList());
  }

  @Override
  public List<ApartmentTransactionDTO> getTransactionsBySeller(String sellerId) {
    List<ApartmentTransaction> transactions = transactionRepository.findBySeller_MemberId(sellerId);
    return transactions.stream()
      .map(this::convertToDto)
      .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public void consentTransaction(String memberId, Long transactionId) {
    String decodedMemberId = memberId;
    ApartmentTransaction transaction = transactionRepository.findById(transactionId)
      .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));
    if (!transaction.getSeller().getMemberId().equals(decodedMemberId)) {
      throw new RuntimeException("권한이 없습니다.");
    }
    transaction.setConsentGiven(true);
    transactionRepository.save(transaction);
  }

  @Override
  public ByteArrayResource generateTransactionDocument(String memberId, Long transactionId) {
    ApartmentTransaction transaction = transactionRepository.findById(transactionId)
      .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));
    try {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      PdfWriter writer = new PdfWriter(baos);
      PdfDocument pdfDoc = new PdfDocument(writer);
      Document document = new Document(pdfDoc);

      document.add(new Paragraph("부동산 거래 양식서").setBold().setFontSize(18));
      document.add(new Paragraph("거래 ID: " + transaction.getId()));
      document.add(new Paragraph("매수자: " + transaction.getBuyer().getMemberId()));
      document.add(new Paragraph("매도자: " + transaction.getSeller().getMemberId()));
      document.add(new Paragraph("아파트: " + transaction.getApartment().getName()));
      document.add(new Paragraph("거래 가격: " + transaction.getPrice() + " 원"));
      document.add(new Paragraph("거래일자: " + transaction.getTransactionDate()));
      document.add(new Paragraph("\n매도자 서명: ________________________"));
      document.close();

      return new ByteArrayResource(baos.toByteArray());
    } catch (Exception e) {
      throw new RuntimeException("문서 생성 중 오류가 발생했습니다.", e);
    }
  }

  @Override
  @Transactional
  public void cancelTransaction(String memberId, Long transactionId) {
    String decodedMemberId = memberId;
    ApartmentTransaction transaction = transactionRepository.findById(transactionId)
      .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));
    if (!transaction.getBuyer().getMemberId().equals(decodedMemberId) &&
      !transaction.getSeller().getMemberId().equals(decodedMemberId)) {
      throw new RuntimeException("취소할 권한이 없습니다.");
    }
    transactionRepository.delete(transaction);
  }

  @Override
  @Transactional
  public ApartmentTransactionDTO completeTransaction(String memberId, Long transactionId) {
    // memberId는 프론트엔드에서 인코딩 없이 전송되도록 설정했으므로 그대로 사용
    String decodedMemberId = memberId;

    ApartmentTransaction transaction = transactionRepository.findById(transactionId)
      .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));

    // 거래 수락은 매도자만 진행할 수 있도록 합니다.
    if (!transaction.getSeller().getMemberId().equals(decodedMemberId)) {
      throw new RuntimeException("권한이 없습니다.");
    }

    // 거래 상태를 "COMPLETED"로 업데이트
    transaction.setStatus("COMPLETED");
    transactionRepository.save(transaction);
    return convertToDto(transaction);
  }

  private ApartmentTransactionDTO convertToDto(ApartmentTransaction transaction) {
    return ApartmentTransactionDTO.builder()
      .id(transaction.getId())
      .buyerId(transaction.getBuyer().getMemberId())
      .sellerId(transaction.getSeller().getMemberId())
      .apartmentId(transaction.getApartment().getId())
      .apartmentName(transaction.getApartment().getName())
      .price(transaction.getPrice())
      .transactionDate(transaction.getTransactionDate())
      .remarks(transaction.getRemarks())
      .consentGiven(transaction.isConsentGiven())
      .status(transaction.getStatus())
      .build();
  }
}

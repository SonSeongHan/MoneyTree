package com.moneytree_back.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.moneytree_back.domain.Apartment;
import com.moneytree_back.domain.ApartmentTransaction;
import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.member.Member;
import com.moneytree_back.dto.ApartmentTransactionDTO;
import com.moneytree_back.repository.ApartmentRepository;
import com.moneytree_back.repository.ApartmentTransactionRepository;
import com.moneytree_back.repository.DandwacRepository;
import com.moneytree_back.repository.MemberRepository;
import com.moneytree_back.service.dandwac.DandwacService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApartmentTransactionServiceImpl implements ApartmentTransactionService {

  private final ApartmentTransactionRepository transactionRepository;
  private final MemberRepository memberRepository;
  private final ApartmentRepository apartmentRepository;
  private final DandwacService dandwacService;
  private final DandwacRepository dandwacRepository;

  @Override
  @Transactional
  public ApartmentTransactionDTO createTransaction(String buyerId, String sellerId, String apartmentName, Integer price, String remarks) {
    log.info("createTransaction 시작: buyerId={}, sellerId={}, apartmentName={}, price={}, remarks={}",
            buyerId, sellerId, apartmentName, price, remarks);

    Member seller = memberRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("매도자가 존재하지 않습니다."));
    Member buyer = memberRepository.findById(buyerId)
            .orElseThrow(() -> new RuntimeException("매수자가 존재하지 않습니다."));

    var apartment = apartmentRepository.findByName(apartmentName)
            .orElseThrow(() -> new RuntimeException("아파트를 찾을 수 없습니다."));

    BigDecimal transactionAmount = BigDecimal.valueOf(price).multiply(BigDecimal.valueOf(10000));

    Dandwac buyerAccount = dandwacService.findAccountByMemberId(buyerId);
    Dandwac sellerAccount = dandwacService.findAccountByMemberId(sellerId);
    if (buyerAccount == null) {
      throw new RuntimeException("매수자의 계좌를 찾을 수 없습니다.");
    }
    if (sellerAccount == null) {
      throw new RuntimeException("매도자의 계좌를 찾을 수 없습니다.");
    }
    if (!apartment.getOwnerId().equals(sellerId)) {
      throw new RuntimeException("매도자는 해당 아파트의 실제 소유자여야 합니다.");
    }

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
    log.info("거래 생성 완료, 거래 ID: {}", savedTransaction.getId());
    return convertToDto(savedTransaction);
  }

  @Override
  @Transactional
  public boolean submitSellerAuth(Long transactionId, String memberId, String signature, String comments) {
    ApartmentTransaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));

    // 매도자만 인증 문서를 제출할 수 있도록 확인
    if (!transaction.getSeller().getMemberId().equals(memberId)) {
      throw new RuntimeException("매도자만 인증 문서를 제출할 수 있습니다.");
    }

    // 매도자 인증 데이터 저장
    transaction.setSellerSignature(signature);
    transaction.setSellerComments(comments);

    // 매도 인증 후 거래 완료 처리
    ApartmentTransactionDTO dto = completeTransaction(memberId, transactionId);

    // 거래 완료 상태가 "COMPLETED"라면 인증 완료 처리
    return "COMPLETED".equals(dto.getStatus());
  }

  @Override
  @Transactional
  public ApartmentTransactionDTO completeTransaction(String memberId, Long transactionId) {
    ApartmentTransaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));

    // 매도자 본인인지 확인
    if (!transaction.getSeller().getMemberId().equals(memberId)) {
      throw new RuntimeException("권한이 없습니다.");
    }

    // 가격만큼 계좌 이체 등 처리
    BigDecimal transactionAmount = BigDecimal.valueOf(transaction.getPrice()).multiply(BigDecimal.valueOf(10000));
    Dandwac buyerAccount = dandwacService.findAccountByMemberId(transaction.getBuyer().getMemberId());
    Dandwac sellerAccount = dandwacService.findAccountByMemberId(transaction.getSeller().getMemberId());

    if (buyerAccount.getBalance().compareTo(transactionAmount) < 0) {
      throw new RuntimeException("매수자의 등록된 계좌 잔액이 부족합니다.");
    }

    buyerAccount.setBalance(buyerAccount.getBalance().subtract(transactionAmount));
    sellerAccount.setBalance(sellerAccount.getBalance().add(transactionAmount));
    dandwacRepository.save(buyerAccount);
    dandwacRepository.save(sellerAccount);

    // **거래 완료 상태로 변경**
    transaction.setStatus("COMPLETED");
    transactionRepository.save(transaction);

    // **아파트 소유자(ownerId)를 매수자로 변경**
    Apartment apt = transaction.getApartment();
    apt.setOwnerId(transaction.getBuyer().getMemberId());
    apartmentRepository.save(apt); // ← 소유주 변경 반영

    log.info("거래 완료: transactionId={}", transactionId);
    return convertToDto(transaction);
  }


  @Override
  public ByteArrayResource generateTransactionDocument(String memberId, Long transactionId) {
    ApartmentTransaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));

    try {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      var writer = new PdfWriter(baos);
      var pdfDoc = new PdfDocument(writer);
      var document = new Document(pdfDoc);

      document.add(new Paragraph("부동산 거래 계약서").setBold().setFontSize(18));
      document.add(new Paragraph("거래 ID: " + transaction.getId()));
      document.add(new Paragraph("매수자: " + transaction.getBuyer().getMemberId()));
      document.add(new Paragraph("매도자: " + transaction.getSeller().getMemberId()));
      document.add(new Paragraph("아파트: " + transaction.getApartment().getName()));
      document.add(new Paragraph("거래 가격: " + transaction.getPrice() + " 만원"));
      document.add(new Paragraph("거래일자: " + transaction.getTransactionDate()));
      document.add(new Paragraph("\n매수자 서명: ________________________"));
      document.add(new Paragraph("\n매도자 서명: ________________________"));
      document.close();

      log.info("거래 계약서 PDF 생성 완료, transactionId={}, PDF 크기: {} bytes", transactionId, baos.size());
      return new ByteArrayResource(baos.toByteArray());
    } catch (Exception e) {
      log.error("거래 계약서 PDF 생성 중 오류", e);
      throw new RuntimeException("문서 생성 중 오류가 발생했습니다.", e);
    }
  }

  @Override
  @Transactional
  public List<ApartmentTransactionDTO> getTransactionsByBuyer(String buyerId) {
    List<ApartmentTransaction> transactions = transactionRepository.findByBuyer_MemberId(buyerId);
    return transactions.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
  }
  @Override
  @Transactional(readOnly = true)
  public ApartmentTransactionDTO getTransaction(Long transactionId) {
    ApartmentTransaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));
    return convertToDto(transaction);
  }


  @Override
  @Transactional
  public void consentTransaction(String memberId, Long transactionId) {
    ApartmentTransaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));

    // 매도자가 아닌 사용자가 거래에 동의할 수 없음
    if (!transaction.getSeller().getMemberId().equals(memberId)) {
      throw new RuntimeException("권한이 없습니다.");
    }

    transaction.setConsentGiven(true);
    transactionRepository.save(transaction);
    log.info("동의 처리 완료: transactionId={}", transactionId);
  }

  @Override
  @Transactional
  public void cancelTransaction(String memberId, Long transactionId) {
    ApartmentTransaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));
    if (!transaction.getBuyer().getMemberId().equals(memberId) &&
            !transaction.getSeller().getMemberId().equals(memberId)) {
      throw new RuntimeException("취소할 권한이 없습니다.");
    }
    transactionRepository.delete(transaction);
    log.info("거래 취소 완료: transactionId={}", transactionId);
  }

  @Override
  @Transactional
  public List<ApartmentTransactionDTO> getTransactionsBySeller(String sellerId) {
    List<ApartmentTransaction> transactions = transactionRepository.findBySeller_MemberId(sellerId);
    return transactions.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
  }

  private ApartmentTransactionDTO convertToDto(ApartmentTransaction transaction) {
    return ApartmentTransactionDTO.builder()
            .id(transaction.getId())
            .buyerId(transaction.getBuyer().getMemberId())
            .sellerId(transaction.getSeller().getMemberId())
            .apartmentId(transaction.getApartment().getId())
            .apartmentName(transaction.getApartment().getName())
            .price(transaction.getPrice())
            .requestTime(transaction.getRequestTime())      // 요청 시간
            .completionTime(transaction.getCompletionTime()) // 완료 시간
            .transactionDate(transaction.getTransactionDate()) // 기존 호환성 유지
            .remarks(transaction.getRemarks())
            .consentGiven(transaction.isConsentGiven())
            .status(transaction.getStatus())
            .build();
  }
}

package com.moneytree_back.service;

import com.moneytree_back.domain.MemberLoan;
import com.moneytree_back.domain.MortgageLoanProductEntity;
import com.moneytree_back.dto.MemberLoanDTO;
import com.moneytree_back.dto.MortgageLoanProductDTO;
import com.moneytree_back.repository.MemberLoanRepository;
import com.moneytree_back.repository.MortgageLoanProductRepository;
import com.moneytree_back.service.dandwac.DandwacService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MortgageLoanProductServiceImpl implements MortgageLoanProductService {

  private final MortgageLoanProductRepository repository;
  private final MemberLoanRepository memberLoanRepository;
  private final DandwacService dandwacService;

  // 해시 기반 대출 한도 계산 (중복 로직; 필요시 별도 유틸로 분리 가능)
  private long computeLoanLimit(String memberId) {
    int hash = memberId.hashCode();
    long positiveHash = Math.abs((long) hash);
    long range = 1000000000L - 50000000L;
    return (positiveHash % range) + 50000000L;
  }

  // 기존 방식: DB에 저장된 borrowedAmount를 읽어옵니다.
  private long getBorrowedAmount(String memberId) {
    Optional<MemberLoan> optionalLoan = memberLoanRepository.findByMemberId(memberId);
    MemberLoan memberLoan = optionalLoan.orElse(memberLoan = new MemberLoan(
      memberId,
      computeLoanLimit(memberId),
      0L, // borrowedAmount
      computeLoanLimit(memberId), // availableLoanLimit
      false, // hasLoan
      0L, // assets
      0L, // liabilities
      0L, // fixedExpenses
      0L, // fixedIncome
      true  // loanLimitSet
    ));
    return memberLoan.getBorrowedAmount();
  }

  // 금액 포맷 함수
  private String formatWon(long amount) {
    long rounded = (amount / 10000000L) * 10000000L;
    long eok = rounded / 100000000L;
    long chun = (rounded % 100000000L) / 10000000L;
    StringBuilder sb = new StringBuilder();
    if (eok > 0) sb.append(eok).append("억");
    if (chun > 0) sb.append(chun).append("천만원");
    return sb.length() == 0 ? "0원" : sb.append("까지 대출 가능합니다.").toString();
  }

  @Override
  public List<MortgageLoanProductDTO> getMortgageLoanProductsForMember(String memberId) {
    List<MortgageLoanProductEntity> products = repository.findAll();

    Optional<MemberLoan> optionalLoan = memberLoanRepository.findByMemberId(memberId);
    MemberLoan memberLoan;
    if (optionalLoan.isPresent()) {
      memberLoan = optionalLoan.get();
      if (memberLoan.getAvailableLoanLimit() <= 0) {
        memberLoan.setAvailableLoanLimit(memberLoan.getMaxLoanLimit());
      }
    } else {
      // 새 MemberLoan 생성
      memberLoan = new MemberLoan(
        memberId,
        computeLoanLimit(memberId),
        0L,
        computeLoanLimit(memberId),
        false,
        0L,
        0L,
        0L,
        0L,
        true
      );
      memberLoanRepository.save(memberLoan);
    }

    // ★ 여기서 DB에 저장된 maxLoanLimit를 가져옴
    long realMaxLoanLimit = memberLoan.getMaxLoanLimit();
    long availableLimit = memberLoan.getAvailableLoanLimit();
    boolean loanLimitSet = memberLoan.isLoanLimitSet();

    String formattedFixed = formatWon(realMaxLoanLimit);      // 최대 대출 한도 포맷팅
    String formattedAvailable = formatWon(availableLimit);    // 현재 대출 가능 금액 포맷팅

    return products.stream()
      .map(product -> MortgageLoanProductDTO.builder()
        .id(product.getId())
        .dclsMonth(product.getDclsMonth())
        .finCoNo(product.getFinCoNo())
        .finPrdtCd(product.getFinPrdtCd())
        .korCoNm(product.getKorCoNm())
        .finPrdtNm(product.getFinPrdtNm())
        .joinWay(product.getJoinWay())
        .loanInciExpn(product.getLoanInciExpn())
        .erlyRpayFee(product.getErlyRpayFee())
        .dlyRate(product.getDlyRate())
        .loanLmt(product.getLoanLmt())
        .dclsStrtDay(product.getDclsStrtDay())
        .dclsEndDay(product.getDclsEndDay())
        .finCoSubmDay(product.getFinCoSubmDay())

        // ★ 실제 DB의 maxLoanLimit를 fixedLoanLimit에 할당
        .fixedLoanLimit(realMaxLoanLimit)
        .formattedFixedLoanLimit(formattedFixed)

        .availableLoanLimit(availableLimit)
        .formattedAvailableLoanLimit(formattedAvailable)
        .loanLimitSet(loanLimitSet)
        .build())
      .collect(Collectors.toList());
  }

  @Override
  public MortgageLoanProductDTO getMortgageLoanProductByIdForMember(Long id, String memberId) {
    MortgageLoanProductEntity product = repository.findById(id)
      .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

    Optional<MemberLoan> optionalLoan = memberLoanRepository.findByMemberId(memberId);
    MemberLoan memberLoan;
    if (optionalLoan.isPresent()) {
      memberLoan = optionalLoan.get();
      if (memberLoan.getAvailableLoanLimit() <= 0) {
        memberLoan.setAvailableLoanLimit(memberLoan.getMaxLoanLimit());
      }
    } else {
      memberLoan = new MemberLoan(
        memberId,
        computeLoanLimit(memberId),
        0L,
        computeLoanLimit(memberId),
        false,
        0L,
        0L,
        0L,
        0L,
        true
      );
      memberLoanRepository.save(memberLoan);
    }

    // ★ 여기서 DB에 저장된 maxLoanLimit를 가져옴
    long realMaxLoanLimit = memberLoan.getMaxLoanLimit();
    long availableLimit = memberLoan.getAvailableLoanLimit();
    boolean loanLimitSet = memberLoan.isLoanLimitSet();

    // 포맷팅
    String formattedFixed = formatWon(realMaxLoanLimit);
    String formattedAvailable = formatWon(availableLimit);

    return MortgageLoanProductDTO.builder()
      .id(product.getId())
      .dclsMonth(product.getDclsMonth())
      .finCoNo(product.getFinCoNo())
      .finPrdtCd(product.getFinPrdtCd())
      .korCoNm(product.getKorCoNm())
      .finPrdtNm(product.getFinPrdtNm())
      .joinWay(product.getJoinWay())
      .loanInciExpn(product.getLoanInciExpn())
      .erlyRpayFee(product.getErlyRpayFee())
      .dlyRate(product.getDlyRate())
      .loanLmt(product.getLoanLmt())
      .dclsStrtDay(product.getDclsStrtDay())
      .dclsEndDay(product.getDclsEndDay())
      .finCoSubmDay(product.getFinCoSubmDay())

      // ★ 실제 DB의 maxLoanLimit를 fixedLoanLimit에 할당
      .fixedLoanLimit(realMaxLoanLimit)
      .formattedFixedLoanLimit(formattedFixed)

      .availableLoanLimit(availableLimit)
      .formattedAvailableLoanLimit(formattedAvailable)
      .loanLimitSet(loanLimitSet)
      .build();
  }

  @Override
  @Transactional
  public void subscribeMortgageLoanProduct(Long productId, String memberId, long loanAmount) {
    // 기존 레코드가 있으면 업데이트, 없으면 새 객체 생성
    Optional<MemberLoan> optionalLoan = memberLoanRepository.findByMemberId(memberId);
    MemberLoan memberLoan;
    long fixedLimit = computeLoanLimit(memberId);
    if (optionalLoan.isPresent()) {
      memberLoan = optionalLoan.get();
      // 만약 availableLoanLimit이 null이면 기본값(maxLoanLimit)으로 초기화
      if (memberLoan.getAvailableLoanLimit() <= 0) {
        // null 대신 0 이하인 경우로 체크
        memberLoan.setAvailableLoanLimit(memberLoan.getMaxLoanLimit());
      }
    } else {
      memberLoan = new MemberLoan(
        memberId,
        computeLoanLimit(memberId),
        0L, // borrowedAmount
        computeLoanLimit(memberId), // availableLoanLimit
        false, // hasLoan
        0L, // assets
        0L, // liabilities
        0L, // fixedExpenses
        0L, // fixedIncome
        true  // loanLimitSet
      ); // Updated constructor
    }
    // 요청 금액이 availableLoanLimit를 초과하면 예외 발생 (subtractLoanAmount 내부에서 처리)
    memberLoan.subtractLoanAmount(loanAmount);
    memberLoanRepository.save(memberLoan);

    // 계좌 잔액에 대출 금액 반영
    dandwacService.addLoanAmountToBalance(memberId, BigDecimal.valueOf(loanAmount));
  }

  @Override
  public long getAvailableLoanLimitForMember(String memberId) {
    long fixedLimit = computeLoanLimit(memberId);
    Optional<MemberLoan> optionalLoan = memberLoanRepository.findByMemberId(memberId);
    MemberLoan memberLoan = optionalLoan.orElse(memberLoan = new MemberLoan(
      memberId,
      computeLoanLimit(memberId),
      0L, // borrowedAmount
      computeLoanLimit(memberId), // availableLoanLimit
      false, // hasLoan
      0L, // assets
      0L, // liabilities
      0L, // fixedExpenses
      0L, // fixedIncome
      true  // loanLimitSet
    ));
    return memberLoan.getAvailableLoanLimit();
  }

  @Override
  public MemberLoanDTO getMemberLoanDetails(String memberId) {
    long fixedLimit = computeLoanLimit(memberId);
    Optional<MemberLoan> optionalLoan = memberLoanRepository.findByMemberId(memberId);
    MemberLoan memberLoan = optionalLoan.orElse(memberLoan = new MemberLoan(
      memberId,
      computeLoanLimit(memberId),
      0L, // borrowedAmount
      computeLoanLimit(memberId), // availableLoanLimit
      false, // hasLoan
      0L, // assets
      0L, // liabilities
      0L, // fixedExpenses
      0L, // fixedIncome
      true  // loanLimitSet
    ));
    return MemberLoanDTO.builder()
      .memberId(memberLoan.getMemberId())
      .borrowedAmount(memberLoan.getBorrowedAmount())
      .availableLoanLimit(memberLoan.getAvailableLoanLimit())
      .maxLoanLimit(memberLoan.getMaxLoanLimit())
      .build();
  }
}

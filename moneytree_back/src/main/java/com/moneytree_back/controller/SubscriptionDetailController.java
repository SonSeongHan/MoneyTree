package com.moneytree_back.controller;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.MemberLoan;
import com.moneytree_back.domain.MortgageLoanProductEntity;
import com.moneytree_back.dto.MortgageLoanProductDTO;
import com.moneytree_back.dto.SubscriptionDetailDTO;
import com.moneytree_back.repository.MemberLoanRepository;
import com.moneytree_back.repository.MortgageLoanProductRepository;
import com.moneytree_back.service.dandwac.DandwacServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SubscriptionDetailController {

  private final MemberLoanRepository memberLoanRepository;
  private final MortgageLoanProductRepository mortgageLoanProductRepository;
  private final DandwacServiceImpl dandwacServiceImpl;

  // 대출 한도 계산
  private int calculateCreditGrade(Long assets, Long liabilities, Long fixedExpenses, Long fixedIncome) {
    if (assets == null || liabilities == null || fixedExpenses == null || fixedIncome == null) {
      // 기본값을 할당하거나 오류 처리
      assets = assets != null ? assets : 0L;
      liabilities = liabilities != null ? liabilities : 0L;
      fixedExpenses = fixedExpenses != null ? fixedExpenses : 0L;
      fixedIncome = fixedIncome != null ? fixedIncome : 0L;
    }

    long netWorth = assets - liabilities;
    long monthlyIncome = fixedIncome - fixedExpenses;

    // 대출 한도 계산 로직
    if (netWorth > 1000000000L && monthlyIncome > 5000000L) {
      return 1; // 1등급
    } else if (netWorth > 500000000L && monthlyIncome > 3000000L) {
      return 2; // 2등급
    } else if (netWorth > 200000000L && monthlyIncome > 1000000L) {
      return 3; // 3등급
    } else if (netWorth > 100000000L && monthlyIncome > 500000L) {
      return 4; // 4등급
    } else {
      return 5; // 5등급
    }
  }

  // 등급에 따른 대출 한도 계산
  private long getLoanLimitByGrade(int grade) {
    return switch (grade) {
      case 1 -> 1500000000L;
      case 2 -> 1000000000L;
      case 3 -> 700000000L;
      case 4 -> 400000000L;
      case 5 -> 200000000L;
      default -> 0L;
    };
  }

  // 대출 한도 설정 여부 확인
  private boolean isLoanLimitSet(long availableLoanLimit) {
    return availableLoanLimit > 0;
  }

  // 대출 한도 계산 및 반환
  @GetMapping("/subscription-details/{id}")
  public ResponseEntity<Map<String, Object>> getSubscriptionDetail(
    @PathVariable Long id,
    @RequestHeader("memberId") String memberId,
    @RequestParam("assets") long assets,
    @RequestParam("liabilities") long liabilities,
    @RequestParam("fixedExpenses") long fixedExpenses,
    @RequestParam("fixedIncome") long fixedIncome) {

    // 이미 대출 한도가 설정된 회원인지 확인
    Optional<MemberLoan> optionalLoan = memberLoanRepository.findByMemberId(memberId);
    if (optionalLoan.isPresent() && optionalLoan.get().isLoanLimitSet()) {
      MemberLoan memberLoan = optionalLoan.get();

      Map<String, Object> data = new HashMap<>();
      data.put("message", "이미 대출 한도가 설정되었습니다.");
      data.put("isLoanLimitSet", true);
      data.put("remainingLoanAmount", memberLoan.getAvailableLoanLimit());
      data.put("firstTimeSet", false);  // ★ 이미 설정된 경우에는 false
      return ResponseEntity.ok(data);
    }


    // 대출 한도 계산 (최초 계산만 이루어짐)
    int grade = calculateCreditGrade(assets, liabilities, fixedExpenses, fixedIncome);
    long loanLimit = getLoanLimitByGrade(grade);

    MemberLoan memberLoan = optionalLoan.orElse(new MemberLoan());
    memberLoan.setMemberId(memberId);
    memberLoan.setMaxLoanLimit(loanLimit);
    memberLoan.setAvailableLoanLimit(loanLimit);
    memberLoan.setLoanLimitSet(true);
    // 자산, 부채, 수입/지출 등도 세팅
    memberLoan.setAssets(assets);
    memberLoan.setLiabilities(liabilities);
    memberLoan.setFixedExpenses(fixedExpenses);
    memberLoan.setFixedIncome(fixedIncome);

    memberLoanRepository.save(memberLoan);

    Map<String, Object> data = new HashMap<>();
    data.put("message", "대출 한도 계산이 완료되었습니다.");  // ★ 처음 계산일 때
    data.put("isLoanLimitSet", true);
    data.put("remainingLoanAmount", loanLimit);
    data.put("firstTimeSet", true);  // ★ 이번이 최초 계산
    return ResponseEntity.ok(data);
  }


  // 대출 받은 금액 조회
  private long getBorrowedAmount(String memberId) {
    MemberLoan loan = memberLoanRepository.findByMemberId(memberId).orElse(null);
    if (loan != null) {
      return loan.getBorrowedAmount();
    }
    return 0L;
  }

  // 대출 한도 포맷팅 함수
  private String formatWon(long amount) {
    long rounded = (amount / 10000000L) * 10000000L;
    long eok = rounded / 100000000L;
    long chun = (rounded % 100000000L) / 10000000L;
    StringBuilder sb = new StringBuilder();
    if (eok > 0) sb.append(eok).append("억");
    if (chun > 0) sb.append(chun).append("천만원");
    return sb.length() == 0 ? "0원" : sb.append("까지 대출 가능합니다.").toString();
  }

  // MortgageLoanProductEntity를 MortgageLoanProductDTO로 변환하는 메소드
  private MortgageLoanProductDTO convertToDTO(MortgageLoanProductEntity entity) {
    return MortgageLoanProductDTO.builder()
      .id(entity.getId())
      .dclsMonth(entity.getDclsMonth())
      .finCoNo(entity.getFinCoNo())
      .finPrdtCd(entity.getFinPrdtCd())
      .korCoNm(entity.getKorCoNm())
      .finPrdtNm(entity.getFinPrdtNm())
      .joinWay(entity.getJoinWay())
      .loanInciExpn(entity.getLoanInciExpn())
      .erlyRpayFee(entity.getErlyRpayFee())
      .dlyRate(entity.getDlyRate())
      .loanLmt(entity.getLoanLmt())
      .dclsStrtDay(entity.getDclsStrtDay())
      .dclsEndDay(entity.getDclsEndDay())
      .finCoSubmDay(entity.getFinCoSubmDay())
      .build();
  }

  // SubscriptionDetailController.java

  @GetMapping("/subscription-details/{id}/info")
  public ResponseEntity<SubscriptionDetailDTO> getSubscriptionInfo(
    @PathVariable Long id,
    @RequestHeader("memberId") String memberId
  ) {
    // 1) 가입한 상품 조회
    MortgageLoanProductEntity product = mortgageLoanProductRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

    // 2) 회원 대출 정보(MemberLoan) 조회
    MemberLoan memberLoan = memberLoanRepository.findByMemberId(memberId)
      .orElseThrow(() -> new RuntimeException("회원 대출 정보를 찾을 수 없습니다."));

    // 3) 부동산 계좌(Dandwac) 조회
    Dandwac account = dandwacServiceImpl.findAccountByMemberId(memberId);
    // account.getBalance() 등으로 잔액 확인

    // 4) DTO 생성
    SubscriptionDetailDTO dto = SubscriptionDetailDTO.builder()
      .memberId(memberId)
      .finPrdtNm(product.getFinPrdtNm())       // 가입한 상품 이름
      .balance(account.getBalance() != null
        ? account.getBalance().longValue()
        : 0L)                           // 계좌 잔액 (BigDecimal → long 변환 예시)
      .build();

    return ResponseEntity.ok(dto);
  }


}

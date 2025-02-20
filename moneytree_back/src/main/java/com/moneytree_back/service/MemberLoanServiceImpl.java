package com.moneytree_back.service;

import com.moneytree_back.domain.MemberLoan;
import com.moneytree_back.dto.MemberLoanDTO;
import com.moneytree_back.repository.MemberLoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberLoanServiceImpl implements MemberLoanService {

  private final MemberLoanRepository memberLoanRepository;

  // 해시 기반 대출 한도 계산 로직
  private long computeLoanLimit(String memberId) {
    int hash = memberId.hashCode();
    long positiveHash = Math.abs((long) hash);
    long range = 1000000000L - 50000000L; // Example range: 50 million to 1 billion
    return (positiveHash % range) + 50000000L;
  }

  @Override
  public MemberLoanDTO getMemberLoanDetails(String memberId) {
    // 기존 레코드가 있으면 업데이트, 없으면 새 객체 생성
    Optional<MemberLoan> optionalLoan = memberLoanRepository.findByMemberId(memberId);
    MemberLoan memberLoan;

    if (optionalLoan.isPresent()) {
      memberLoan = optionalLoan.get();
      // 기존 대출 한도 세팅이 되어 있지 않으면 설정
      if (memberLoan.getAvailableLoanLimit() <= 0) {
        // null 대신 0 이하인 경우로 체크
        memberLoan.setAvailableLoanLimit(memberLoan.getMaxLoanLimit());
      }
    } else {
      // 새 객체 생성 및 기본값 설정
      memberLoan = new MemberLoan(); // 기본 생성자로 객체 생성
      memberLoan.setMemberId(memberId);
      long loanLimit = computeLoanLimit(memberId);
      memberLoan.setMaxLoanLimit(loanLimit);  // 대출 한도 설정
      memberLoan.setAvailableLoanLimit(loanLimit); // 초기 대출 가능 한도 설정
      memberLoan.setBorrowedAmount(0L);  // 빌린 금액 초기화
      memberLoan.setHasLoan(false);  // 대출 여부 초기화
      memberLoan.setAssets(0L);  // 자산
      memberLoan.setLiabilities(0L);  // 부채
      memberLoan.setFixedExpenses(0L);  // 고정비용
      memberLoan.setFixedIncome(0L);  // 고정수입
      memberLoan.setLoanLimitSet(true); // 대출 한도 설정
      memberLoanRepository.save(memberLoan);
    }

    // MemberLoanDTO로 변환하여 반환
    return MemberLoanDTO.builder()
      .memberId(memberLoan.getMemberId())
      .borrowedAmount(memberLoan.getBorrowedAmount())
      .availableLoanLimit(memberLoan.getAvailableLoanLimit())
      .maxLoanLimit(memberLoan.getMaxLoanLimit())
      .build();
  }

  @Override
    public void addLoanAmount(String memberId, long loanAmount) {
    Optional<MemberLoan> optionalLoan = memberLoanRepository.findByMemberId(memberId);
    MemberLoan memberLoan;

    if (optionalLoan.isPresent()) {
      memberLoan = optionalLoan.get();

      // 대출 한도 세팅이 되어 있지 않으면 설정
      if (memberLoan.getAvailableLoanLimit() <= 0) {
        // null 대신 0 이하인 경우로 체크
        memberLoan.setAvailableLoanLimit(memberLoan.getMaxLoanLimit());
      }

      // 대출 가능 금액이 남아있으면 대출 진행
      if (memberLoan.getAvailableLoanLimit() > 0) {
        memberLoan.subtractLoanAmount(loanAmount);
        memberLoanRepository.save(memberLoan);
      } else {
        throw new IllegalArgumentException("대출 가능한 금액이 부족합니다.");
      }

    } else {
      memberLoan = new MemberLoan(); // 기본 생성자 사용
      memberLoan.setMemberId(memberId);
      long loanLimit = computeLoanLimit(memberId);
      memberLoan.setMaxLoanLimit(loanLimit);  // 대출 한도 설정
      memberLoan.setAvailableLoanLimit(loanLimit); // 대출 가능 한도 설정
      memberLoan.setBorrowedAmount(0L);  // 빌린 금액 초기화
      memberLoan.setHasLoan(false);  // 대출 여부 초기화
      memberLoan.setAssets(0L);  // 자산
      memberLoan.setLiabilities(0L);  // 부채
      memberLoan.setFixedExpenses(0L);  // 고정비용
      memberLoan.setFixedIncome(0L);  // 고정수입
      memberLoan.setLoanLimitSet(true); // 대출 한도 설정
    }

    // 대출 금액 저장
    memberLoanRepository.save(memberLoan);
    memberLoan.subtractLoanAmount(loanAmount); // 대출 금액 차감
  }
}

package com.moneytree_back.service.financialProduct;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.dto.financialProduct.SavingAccountDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface SavingAccountService {

    // 적금 계좌 생성 (가입)
    SavingAccountDTO createSavingAccount(SavingAccountDTO savingAccountDTO);

    // 정기 납입 설정
    void setRegularPayment(Long savingAccountNumber, BigDecimal regularAmount, Integer paymentDay);

    // 정기 납입 해제
    void cancelRegularPayment(Long savingAccountNumber);

    // 특정 입출금 계좌에 속한 적금 계좌 조회
    List<SavingAccountDTO> getSavingAccountsByDandwAcId(Dandwac dandwAcId);

    // 적금 계좌 해지 (중도 해지 포함)
    void terminateSavingAccount(Long savingAccountNumber, String terminationReason);

    // 현재까지 쌓인 이자 계산
    BigDecimal calculateSavingInterest(Long savingAccountNumber);

    // 자동 만기 처리 (만기 시 원금 + 이자 반환)
    void processSavingMaturity();

    // 정기 납입 스케줄 실행
    void scheduleSavingPayments();

    // 회원 요청으로 적금 계좌 생성
    SavingAccountDTO createSavingAccount(Map<String, Object> request, String memberId);

    // 특정 회원의 적금 계좌 목록 조회
    List<SavingAccountDTO> getMySavingAccounts(String memberId);

    // 적금 계좌 해지 처리 및 환급 금액 반환
    Map<String, Object> terminateSavingAccount(Long accountNumber, String reason, String memberId);

    // 정기 납입 설정 (회원 요청 기반)
    String setRegularPayment(Long accountNumber, Map<String, Object> request, String memberId);

    // 정기 납입 해제 (회원 요청 기반)
    String cancelRegularPayment(Long accountNumber, String memberId);
}

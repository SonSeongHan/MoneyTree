package com.moneytree_back.service.financialProduct;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.dto.financialProduct.DepositAccountDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface DepositAccountService {

    // 예금 계좌 생성 (가입)
    DepositAccountDTO createDepositAccount(DepositAccountDTO depositAccountDTO); // 예금 계좌 생성

    void setRegularPayment(Long depositAccountNumber, BigDecimal regularAmount, Integer paymentDay);

    void cancelRegularPayment(Long depositAccountNumber);

    // 특정 입출금 계좌에 속한 예금 계좌 조회
    List<DepositAccountDTO> getDepositAccountsByDandwAcId(Dandwac dandwAcId); // 특정 입출금 계좌에 속한 예금 계좌 조회

    // 예금 계좌 해지 (중도 해지 포함)
    void terminateDepositAccount(Long depositAccountNumber, String depositTerminationReason); // 예금 계좌 해지 후 삭제 // 예금 계좌 해지

    // 현재까지 쌓인 이자 계산
    BigDecimal calculateDepositInterest(Long depositAccountNumber);

    // 자동 만기 처리 (만기 시 원금 + 이자 반환)
    void processDepositMaturity();

    // 정기 납입 스케줄 실행
    void scheduleDepositPayments();

    DepositAccountDTO createDepositAccount(Map<String, Object> request, String memberId);

    List<DepositAccountDTO> getMyDepositAccounts(String memberId);

    Map<String, Object> terminateDepositAccount(Long accountNumber, String reason, String memberId);

    String setRegularPayment(Long accountNumber, Map<String, Object> request, String memberId);

    String cancelRegularPayment(Long accountNumber, String memberId);
}


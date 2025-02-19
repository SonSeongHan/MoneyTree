package com.moneytree_back.service.dandwac;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.dto.DandwacDTO;
import java.math.BigDecimal;

public interface DandwacService {

    // 계좌 생성
    Dandwac createAccount(DandwacDTO dandwacDTO);

    // 계좌 번호 조회 (02.17 손성한)
    String getDandwacAccountNumberByMemberId(String memberId);

    // 계좌 잔액 조회 (02.17 손성한)
    BigDecimal getDandwacBalance(String dandwAcId);

    // 특정 계좌 조회
    Dandwac getAccount(String dandwAcId);

    // memberId로 계좌 찾기
    Dandwac findAccountByMemberId(String memberId);

    /**
     * 송금 (로그인 사용자 → receiverAccountId)
     */
    void transferMoney(String memberId,
                       String receiverAccountId,
                       BigDecimal amount,
                       String password,
                       String depositPurpose,
                       String fromMemberName,
                       String toMemberName);

    /**
     * 입금(충전)
     */
    void depositMoney(String memberId,
                      String password,
                      BigDecimal amount,
                      String depositPurpose);

    /**
     * 입출금 계좌에서 주식 계좌로 금액 이동
     * @param dandwAcId 입출금 계좌 ID
     * @param stockAccountNumber 주식 계좌 번호
     * @param amount 이동할 금액
     */
    void transferToStockAccount(String dandwAcId, Long stockAccountNumber, BigDecimal amount);

    /**
     * 대출 받은 금액을 계좌 잔액에 추가하는 메서드
     *
     * @param memberId 회원 아이디
     * @param loanAmount 대출 받은 금액 (원 단위)
     * @return 업데이트된 계좌 정보
     */
    Dandwac addLoanAmountToBalance(String memberId, BigDecimal loanAmount);
}


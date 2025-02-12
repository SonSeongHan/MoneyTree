package com.moneytree_back.service;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.dto.DandwacDTO;
import java.math.BigDecimal;

public interface DandwacService {

    // 계좌 생성
    Dandwac createAccount(DandwacDTO dandwacDTO);

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
}

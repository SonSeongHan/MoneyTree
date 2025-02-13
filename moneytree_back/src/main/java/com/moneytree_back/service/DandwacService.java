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
     * 로그인된 사용자 계좌에서
     * 수신자 계좌(receiverAccountId)로 송금
     */
    void transferMoney(String memberId, String receiverAccountId, BigDecimal amount, String password);
}

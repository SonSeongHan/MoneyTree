package com.moneytree_back.service;

import com.moneytree_back.domain.TransactionHistory;
import java.util.List;

public interface TransactionHistoryService {
    /**
     * 주어진 member_id의 입출금 계좌에 대해, 현재 시각으로부터 지난 'months' 개월 이내의 거래 내역을 반환합니다.
     *
     * @param memberId 회원 식별자
     * @param months   조회할 기간(개월 수)
     * @return 필터링된 거래 내역 리스트
     */
    List<TransactionHistory> getTransactionsForMember(String memberId, int months);
}

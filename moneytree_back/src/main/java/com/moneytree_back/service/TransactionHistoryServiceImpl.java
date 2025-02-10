package com.moneytree_back.service;


import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.TransactionHistory;
import com.moneytree_back.repository.DandwacRepository;
import com.moneytree_back.repository.TransactionHistoryRepository;
import com.moneytree_back.service.TransactionHistoryService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionHistoryServiceImpl implements TransactionHistoryService {

    private final TransactionHistoryRepository transactionHistoryRepository;
    private final DandwacRepository dandwacRepository;

    public TransactionHistoryServiceImpl(TransactionHistoryRepository transactionHistoryRepository,
                                         DandwacRepository dandwacRepository) {
        this.transactionHistoryRepository = transactionHistoryRepository;
        this.dandwacRepository = dandwacRepository;
    }

    @Override
    public List<TransactionHistory> getTransactionsForMember(String memberId, int months) {
        // member_id로 입출금 계좌 조회
        Dandwac account = dandwacRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new RuntimeException("입출금 계좌를 찾을 수 없습니다. member_id: " + memberId));

        // 기준 날짜 계산: 현재 시각에서 'months' 개월 전
        LocalDateTime cutoffDate = LocalDateTime.now().minusMonths(months);

        // 모든 거래 내역을 로드한 후, 해당 계좌 관련 및 기준 날짜 이후의 내역만 필터링
        List<TransactionHistory> allTransactions = transactionHistoryRepository.findAll();
        return allTransactions.stream()
                .filter(tx ->
                        (tx.getFromAccount().equals(account) || tx.getToAccount().equals(account))
                                && tx.getCreatedAt().isAfter(cutoffDate)
                )
                .collect(Collectors.toList());
    }
}
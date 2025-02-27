package com.moneytree_back.service;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.TransactionHistory;
import com.moneytree_back.domain.TransactionHistoryType;
import com.moneytree_back.dto.TransferHistoryDTO;
import com.moneytree_back.repository.DandwacRepository;
import com.moneytree_back.repository.TransactionHistoryRepository;
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
    public List<TransferHistoryDTO> getTransactionsForMember(String memberId, int months) {
        // member_id로 입출금 계좌(Dandwac) 조회
        Dandwac account = dandwacRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new RuntimeException("입출금 계좌를 찾을 수 없습니다. member_id: " + memberId));

        // 기준 날짜 계산: 현재 시각으로부터 months 개월 전
        LocalDateTime cutoffDate = LocalDateTime.now().minusMonths(months);

        // 모든 거래 내역 중, 해당 계좌와 기준 날짜 이후의 내역 및 예금해지가 아닌 것만 필터링
        List<TransactionHistory> filteredTransactions = transactionHistoryRepository.findAll().stream()
                .filter(tx -> (tx.getFromAccount().equals(account) || tx.getToAccount().equals(account))
                        && tx.getCreatedAt().isAfter(cutoffDate)
                        // transactionHistoryType이 null이 아닌 경우만 필터링
                        && tx.getTransactionHistoryType() != null
                        && tx.getTransactionHistoryType() != TransactionHistoryType.예금해지)
                .peek(tx -> {
                    // 연관된 계좌의 Member 이름 설정 (초기화)
                    if (tx.getFromAccount() != null && tx.getFromAccount().getMember() != null) {
                        tx.setFromMemberName(tx.getFromAccount().getMember().getMemberName());
                    }
                    if (tx.getToAccount() != null && tx.getToAccount().getMember() != null) {
                        tx.setToMemberName(tx.getToAccount().getMember().getMemberName());
                    }
                })
                .collect(Collectors.toList());

        // 엔티티를 TransferHistoryDTO로 변환 (null일 경우 "알 수 없음" 처리)
        return filteredTransactions.stream()
                .map(tx -> TransferHistoryDTO.builder()
                        .id(tx.getId())
                        .transactionType(tx.getTransactionHistoryType() != null
                                ? tx.getTransactionHistoryType().toString()
                                : "알 수 없음")
                        .amount(tx.getAmount().doubleValue())
                        .createdAt(tx.getCreatedAt())
                        .fromMemberName(tx.getFromMemberName())
                        .toMemberName(tx.getToMemberName())
                        .build())
                .collect(Collectors.toList());
    }

}

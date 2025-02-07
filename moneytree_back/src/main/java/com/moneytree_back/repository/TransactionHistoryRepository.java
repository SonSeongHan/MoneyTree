package com.moneytree_back.repository;

import com.moneytree_back.domain.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long> {
    // 기본 메서드를 사용하며, 추가 필터링은 서비스 계층에서 진행합니다.
}

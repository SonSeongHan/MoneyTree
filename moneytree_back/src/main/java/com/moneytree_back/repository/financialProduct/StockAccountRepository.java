package com.moneytree_back.repository.financialProduct;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.financialProduct.StockAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockAccountRepository extends JpaRepository<StockAccount, Long> {
    // 특정 입출금 계좌에 연결된 주식 계좌 찾기
    StockAccount findByDandwAcId(Dandwac dandwAcId);
}
package com.moneytree_back.repository.financialProduct;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.financialProduct.FundAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FundAccountRepository extends JpaRepository<FundAccount, Long> {
    // 특정 입출금 계좌에 연결된 펀드 계좌 찾기
    List<FundAccount> findAllByDandwAcId(Dandwac dandwAcId);

    // 특정 펀드 계좌 조회
    FundAccount findByFundAccountNumber(Long fundAccountNumber);
}
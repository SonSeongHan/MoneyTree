package com.moneytree_back.repository.financialProduct;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.financialProduct.DepositAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepositAccountRepository extends JpaRepository<DepositAccount, Long> {
    List<DepositAccount> findByDandwAcId(Dandwac dandwAc); // ✅ 엔티티 타입으로 변경

}

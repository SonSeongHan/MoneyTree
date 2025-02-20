package com.moneytree_back.repository.financialProduct;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.financialProduct.DepositAccount;
import com.moneytree_back.domain.financialProduct.DepositAccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepositAccountRepository extends JpaRepository<DepositAccount, Long> {
    List<DepositAccount> findByDandwAcIdAndDepositAccountStatus(
            Dandwac dandwAc,
            DepositAccountStatus depositAccountStatus
    );
}

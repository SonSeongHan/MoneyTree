package com.moneytree_back.repository.financialProduct;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.financialProduct.SavingAccount;
import com.moneytree_back.domain.financialProduct.SavingAccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavingAccountRepository extends JpaRepository<SavingAccount, Long> {
    List<SavingAccount> findByDandwAcIdAndSavingAccountStatus(
            Dandwac dandwAc,
            SavingAccountStatus savingAccountStatus
    );
}
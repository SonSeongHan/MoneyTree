package com.moneytree_back.repository.financialProduct;

import com.moneytree_back.domain.financialProduct.SavingTermination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavingTerminationRepository extends JpaRepository<SavingTermination, Long> {
    Optional<SavingTermination> findBySavingAccount_SavingAccountNumber(Long savingAccountNumber);
}
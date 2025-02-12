package com.moneytree_back.repository.financialProduct;

import com.moneytree_back.domain.financialProduct.DepositTermination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepositTerminationRepository extends JpaRepository<DepositTermination, Long> {
}
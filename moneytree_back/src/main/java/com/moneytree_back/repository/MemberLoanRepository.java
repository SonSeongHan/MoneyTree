package com.moneytree_back.repository;

import com.moneytree_back.domain.MemberLoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberLoanRepository extends JpaRepository<MemberLoan, Long> {
  Optional<MemberLoan> findByMemberId(String memberId);
}

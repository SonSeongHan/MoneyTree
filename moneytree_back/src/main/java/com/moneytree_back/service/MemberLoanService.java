package com.moneytree_back.service;

import com.moneytree_back.dto.MemberLoanDTO;

public interface MemberLoanService {
  MemberLoanDTO getMemberLoanDetails(String memberId);
  void addLoanAmount(String memberId, long loanAmount);
}

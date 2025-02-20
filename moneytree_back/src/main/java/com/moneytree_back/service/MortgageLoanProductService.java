package com.moneytree_back.service;

import com.moneytree_back.dto.MemberLoanDTO;
import com.moneytree_back.dto.MortgageLoanProductDTO;

import java.util.List;

public interface MortgageLoanProductService {
  List<MortgageLoanProductDTO> getMortgageLoanProductsForMember(String memberId);
  MortgageLoanProductDTO getMortgageLoanProductByIdForMember(Long id, String memberId);
  void subscribeMortgageLoanProduct(Long productId, String memberId, long loanAmount);
  long getAvailableLoanLimitForMember(String memberId);
  MemberLoanDTO getMemberLoanDetails(String memberId);
}

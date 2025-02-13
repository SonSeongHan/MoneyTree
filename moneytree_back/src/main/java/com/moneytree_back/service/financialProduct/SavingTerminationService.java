package com.moneytree_back.service.financialProduct;

import com.moneytree_back.dto.financialProduct.SavingTerminationDTO;
import java.util.List;

public interface SavingTerminationService {

    // 특정 적금 계좌의 해지 내역 조회
    SavingTerminationDTO findBySavingAccountNumber(Long savingAccountNumber);

    // 전체 해지 내역 조회 (관리자용)
    List<SavingTerminationDTO> findAllTerminations();

    // 특정 회원의 해지 내역 조회
    List<SavingTerminationDTO> findTerminationsByMemberId(String memberId);
}
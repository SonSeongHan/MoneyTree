package com.moneytree_back.service.financialProduct;

import com.moneytree_back.dto.financialProduct.DepositTerminationDTO;
import java.util.List;

public interface DepositTerminationService {

    // 특정 예금 계좌의 해지 내역 조회
    DepositTerminationDTO findByDepositAccountNumber(Long depositAccountNumber);

    // 전체 해지 내역 조회 (관리자용)
    List<DepositTerminationDTO> findAllTerminations();
}

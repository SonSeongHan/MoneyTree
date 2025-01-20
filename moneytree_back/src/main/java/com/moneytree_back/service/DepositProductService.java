package com.moneytree_back.service;

import com.moneytree_back.dto.DepositProductDTO;
import org.python.icu.math.BigDecimal;

import java.util.List;

public interface DepositProductService {
    // 모든 예금 상품 조회
    List<DepositProductDTO> getAllDepositProducts();

    // 특정 예금 상품 조회(ID로)
    DepositProductDTO getDepositProductById(Long depositProductId);

    // 특정 은행의 예금 상품 조회
    List<DepositProductDTO> getDepositProductsByBankName(String bankName);

    // 최소 금액 이상의 예금 상품 조회
    List<DepositProductDTO> getDepositProductsByMinAmount(BigDecimal minAmount);

    // 예금 상품 생성
    DepositProductDTO createDepositProduct(DepositProductDTO depositProductDTO);

    // 예금 상품 수정
    DepositProductDTO updateDepositProduct(Long depositProductId, DepositProductDTO depositProductDTO);

    // 예금 상품 삭제
    void deleteDepositProduct(Long depositProductId);

}

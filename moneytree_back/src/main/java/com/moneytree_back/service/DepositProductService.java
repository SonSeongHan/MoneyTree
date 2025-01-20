package com.moneytree_back.service;

import com.moneytree_back.dto.DepositProductDTO;

import java.math.BigDecimal;
import java.util.List;

public interface DepositProductService {
    // API 데이터를 저장
    void saveDepositProducts(List<DepositProductDTO> depositProductDTOs);

    // 서버 실행 시 API 데이터를 가져와 저장
    void fetchAndStoreDepositProducts();

    // 모든 예금 상품 조회
    List<DepositProductDTO> getAllDepositProducts();

    // 특정 예금 상품 조회(ID로)
    DepositProductDTO getDepositProductById(Long depositProductId);

    // 특정 은행의 예금 상품 조회
    List<DepositProductDTO> getDepositProductsByBankName(String bankName);

    // 최소 금액 이상의 예금 상품 조회
    List<DepositProductDTO> getDepositProductsByMinAmount(BigDecimal depositMinAmount);

    // 예금 상품 생성
    DepositProductDTO createDepositProduct(DepositProductDTO depositProductDTO);

    // 예금 상품 수정
    DepositProductDTO updateDepositProduct(Long depositProductId, DepositProductDTO depositProductDTO);

    // 예금 상품 삭제
    void deleteDepositProduct(Long depositProductId);
}

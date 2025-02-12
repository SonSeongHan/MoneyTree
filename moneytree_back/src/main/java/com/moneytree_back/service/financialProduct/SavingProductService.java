package com.moneytree_back.service.financialProduct;

import com.moneytree_back.dto.financialProduct.SavingProductDTO;

import java.math.BigDecimal;
import java.util.List;

public interface SavingProductService {

    // 서버 실행 시 Api 데이터를 가져와서 저장
    void fetchAndStoreSavingProducts();

    // Api 데이터 저장
    void saveSavingProducts(List<SavingProductDTO> savingProductDTOs);

    // 모든 적금 상품 조회
    List<SavingProductDTO> getAllSavingProducts();

    // 특정 적금 상품 조회(ID)
    SavingProductDTO getSavingProductById(Long savingProductId);

    // 특정 은행의 적금 상품 조회
    List<SavingProductDTO> getSavingProductsByBankName(String savingBankName);

    // 최소 금액 이상 적금 상품 조회
    List<SavingProductDTO> getSavingProductsByMinAmount(BigDecimal savingMinAmount);

    // 이율 유형별 적금 상품 조회
    List<SavingProductDTO> getSavingProductsByInterestRateType(String savingInterestRateType);

    // 기본 이자율 범위 내 적금 상품 조회
    List<SavingProductDTO> getSavingProductsByBaseInterestRateRange(BigDecimal minSavingBaseInterestRate, BigDecimal maxSavingBaseInterestRate);

    // 최고 우대 이자율 이상인 적금 상품 조회
    List<SavingProductDTO> getSavingProductsByPrimeInterestRate(BigDecimal minSavingPrimeInterestRate);

    // 적금 상품 생성
    SavingProductDTO createSavingProduct(SavingProductDTO savingProductDTO);

    // 적금 상품 수정
    SavingProductDTO updateSavingProduct(Long savingProductId, SavingProductDTO savingProductDTO);

    // 적금 상품 삭제
    void deleteSavingProduct(Long savingProductId);

}

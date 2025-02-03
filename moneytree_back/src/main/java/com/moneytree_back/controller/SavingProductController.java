package com.moneytree_back.controller;

import com.moneytree_back.dto.SavingProductDTO;
import com.moneytree_back.service.SavingProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/saving-products")
@RequiredArgsConstructor
public class SavingProductController {

    private final SavingProductService savingProductService;

    // 모든 적금 상품 조회
    @GetMapping
    public ResponseEntity<List<SavingProductDTO>> getAllSavingProducts(){
        return ResponseEntity.ok(savingProductService.getAllSavingProducts());
    }

    // Id로 특정 적금 조회
    @GetMapping("/{savingProductId}")
    public ResponseEntity<SavingProductDTO> getSavingProductById(@PathVariable Long savingProductId) {
        return ResponseEntity.ok(savingProductService.getSavingProductById(savingProductId));
    }

    // 특정 은행 적금 조회
    @GetMapping("/bank")
    public ResponseEntity<List<SavingProductDTO>> getSavingProductsByBankName(@RequestParam String savingBankName) {
        return ResponseEntity.ok(savingProductService.getSavingProductsByBankName(savingBankName));
    }

    // 최소 금액 이상 적금 조회
    @GetMapping("/min-amount")
    public ResponseEntity<List<SavingProductDTO>> getSavingProductsByMinAmount(@RequestParam BigDecimal savingMinAmount) {
        return ResponseEntity.ok(savingProductService.getSavingProductsByMinAmount(savingMinAmount));
    }

    // 이율 유형에 따라 조회
    @GetMapping("/interest-rate-type")
    public ResponseEntity<List<SavingProductDTO>> getSavingProductsByInterestRateType(@RequestParam String savingInterestRateType) {
        return ResponseEntity.ok(savingProductService.getSavingProductsByInterestRateType(savingInterestRateType));
    }

    // 이율 범위에 따라 조회
    @GetMapping("/base-interest-rate-range")
    public ResponseEntity<List<SavingProductDTO>> getSavingProductsByBaseInterestRateRange(
            @RequestParam BigDecimal minSavingBaseInterestRate, @RequestParam BigDecimal maxSavingBaseInterestRate) {
        return ResponseEntity.ok(savingProductService.getSavingProductsByBaseInterestRateRange(minSavingBaseInterestRate, maxSavingBaseInterestRate));
    }

    // 우대 이율 조회
    @GetMapping("/prime-interest-rate")
    public ResponseEntity<List<SavingProductDTO>> getSavingProductsByPrimeInterestRate(@RequestParam BigDecimal minSavingPrimeInterestRate) {
        return ResponseEntity.ok(savingProductService.getSavingProductsByPrimeInterestRate(minSavingPrimeInterestRate));
    }

    // 적금 상품 생성
    @PostMapping
    public ResponseEntity<SavingProductDTO> createSavingProduct(@RequestBody SavingProductDTO savingProductDTO) {
        return ResponseEntity.ok(savingProductService.createSavingProduct(savingProductDTO));
    }

    // 적금 상품 수정
    @PutMapping("/{savingProductId}")
    public ResponseEntity<SavingProductDTO> updateSavingProduct(@PathVariable Long savingProductId, @RequestBody SavingProductDTO savingProductDTO) {
        return ResponseEntity.ok(savingProductService.updateSavingProduct(savingProductId, savingProductDTO));
    }


    // 적금 상품 삭제
    @DeleteMapping("/{savingProductId}")
    public ResponseEntity<Void> deleteSavingProduct(@PathVariable Long savingProductId) {
        savingProductService.deleteSavingProduct(savingProductId);
        return ResponseEntity.noContent().build();
    }
}

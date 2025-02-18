package com.moneytree_back.controller;

import com.moneytree_back.domain.MortgageLoanProductEntity;
import com.moneytree_back.repository.MortgageLoanProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/fss")
@RequiredArgsConstructor
public class MortgageLoanProductController {

    private final MortgageLoanProductRepository mortgageLoanProductRepository;

    // 모든 모기지론 상품 조회 엔드포인트
    @GetMapping("/mortgage-loan-products")
    public ResponseEntity<List<MortgageLoanProductEntity>> getMortgageLoanProducts() {
        List<MortgageLoanProductEntity> products = mortgageLoanProductRepository.findAll();
        return ResponseEntity.ok(products);
    }

    // 개별 모기지론 상품 상세 조회 엔드포인트
    @GetMapping("/mortgage-loan-products/{id}")
    public ResponseEntity<MortgageLoanProductEntity> getMortgageLoanProductById(@PathVariable Long id) {
        Optional<MortgageLoanProductEntity> productOpt = mortgageLoanProductRepository.findById(id);
        return productOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

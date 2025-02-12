package com.moneytree_back.controller.financialProduct;

import com.moneytree_back.dto.financialProduct.DepositProductDTO;
import com.moneytree_back.service.financialProduct.DepositProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/deposit-products")
public class DepositProductController {

    private final DepositProductService depositProductService;

    public DepositProductController(DepositProductService depositProductService) {
        this.depositProductService = depositProductService;
    }

    // 전체 상품 조회
    @GetMapping("/all")
    public List<DepositProductDTO> getAllDepositProducts() {
        return depositProductService.getAllDepositProducts();
    }

    // 특정 예금 상품 상세 조회
    @GetMapping("/{depositProductId}")
    public DepositProductDTO getDepositProductById(@PathVariable Long depositProductId) {
        return depositProductService.getDepositProductById(depositProductId);
    }

    // 은행 이름으로 필터링
    @GetMapping("/bank")
    public List<DepositProductDTO> getDepositProductsByBankName(@RequestParam String bankName){
        return depositProductService.getDepositProductsByBankName(bankName);
    }

    // 예금 상품 최소 금액 이상 필터링
    @GetMapping("/min-amount")
    public List<DepositProductDTO> getDepositProductsByMinAmount(@RequestParam BigDecimal depositMinAmount){
        return depositProductService.getDepositProductsByMinAmount(depositMinAmount);
    }

    // 이율 유형별 조회
    @GetMapping("/interest-rate-type")
    public List<DepositProductDTO> getDepositProductsByInterestRateType(@RequestParam String depositInterestRateType){
        return depositProductService.getDepositProductsByInterestRateType(depositInterestRateType);
    }

    // 기본 이자율 범위 내 조회
    @GetMapping("/base-interest-rate")
    public List<DepositProductDTO> getDepositProductsByBaseInterestRate(@RequestParam BigDecimal minDepositBaseInterestRate, @RequestParam BigDecimal maxDepositBaseInterestRate) {
        return depositProductService.getDepositProductsByBaseInterestRateRange(minDepositBaseInterestRate, maxDepositBaseInterestRate);
    }

    // 최고 우대 이자율 이상 조회
    @GetMapping("/prime-interest-rate")
    public List<DepositProductDTO> getDepositProductsByPrimeInterestRate(@RequestParam BigDecimal minDepositPrimeInterestRate) {
        return depositProductService.getDepositProductsByPrimeInterestRate(minDepositPrimeInterestRate);
    }

    // 예치 기간 예금 상품 조회
    @GetMapping("/maturity-period")
    public ResponseEntity<List<DepositProductDTO>> getDepositsByMaturityPeriod(
            @RequestParam int depositMaturityPeriod) {
        List<DepositProductDTO> depositProducts = depositProductService.getDepositsByMaturityPeriod(depositMaturityPeriod);
        return ResponseEntity.ok(depositProducts);
    }

    // 필터링 기능 통합
    @GetMapping("/search")
    public List<DepositProductDTO> searchDepositProducts(
            @RequestParam(required = false) String bankName,
            @RequestParam(required = false) BigDecimal depositMinAmount,
            @RequestParam(required = false) String depositInterestRateType,
            @RequestParam(required = false) BigDecimal minDepositBaseInterestRate,
            @RequestParam(required = false) BigDecimal maxDepositBaseInterestRate,
            @RequestParam(required = false) BigDecimal minDepositPrimeInterestRate,
            @RequestParam(required = false) Integer depositMaturityPeriod
    ) {
        return depositProductService.searchDepositProducts(
                bankName,
                depositMinAmount,
                depositInterestRateType,
                minDepositBaseInterestRate,
                maxDepositBaseInterestRate,
                minDepositPrimeInterestRate,
                depositMaturityPeriod
        );
    }
}
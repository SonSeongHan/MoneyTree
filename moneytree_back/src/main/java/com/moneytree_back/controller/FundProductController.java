package com.moneytree_back.controller;

import com.moneytree_back.dto.FundProductDTO;
import com.moneytree_back.service.FundProductService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/fund-products")
public class FundProductController {

    private final FundProductService fundProductService;

    public FundProductController(FundProductService fundProductService) {
        this.fundProductService = fundProductService;
    }

    // 모든 펀드 상품 조회
    @GetMapping("/all")
    public List<FundProductDTO> getAllFundProducts() {
        return fundProductService.getAllFundProducts();
    }

    // 특정 펀드 상품 상세 조회
    @GetMapping("/{fundProductId}")
    public FundProductDTO getFundProductById(@PathVariable Long fundProductId) {
        return fundProductService.getFundProductById(fundProductId);
    }

    // 특정 연도의 펀드 조회
    @GetMapping("/year")
    public List<FundProductDTO> getFundProductsByYear(@RequestParam String fundProductYear) {
        return fundProductService.getFundProductsByFundTotalAmountRange(new BigDecimal(fundProductYear), new BigDecimal(fundProductYear));
    }

    // 펀드 총 규모 범위 내 조회
    @GetMapping("/total-amount")
    public List<FundProductDTO> getFundProductsByTotalAmountRange(@RequestParam BigDecimal minFundTotalAmount, @RequestParam BigDecimal maxFundTotalAmount) {
        return fundProductService.getFundProductsByFundTotalAmountRange(minFundTotalAmount, maxFundTotalAmount);
    }

    // 운용 보수가 특정 값 이상인 펀드 조회
    @GetMapping("/management-fee")
    public List<FundProductDTO> getFundProductsByManagementFee(@RequestParam BigDecimal minFundManagementFee) {
        return fundProductService.getFundProductsByFundManagementFee(minFundManagementFee);
    }

    // 환매 수수료가 특정 값 이하인 펀드 조회
    @GetMapping("/redemption-fee")
    public List<FundProductDTO> getFundProductsByRedemptionFee(@RequestParam BigDecimal maxFundRedemptionFee) {
        return fundProductService.getFundProductsByFundRedemptionFee(maxFundRedemptionFee);
    }

}

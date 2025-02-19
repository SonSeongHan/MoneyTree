package com.moneytree_back.dto.financialProduct;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockHoldingDTO {
    private Long stockHoldingId;             // 주식 보유 내역 ID
    private Long stockAccountNumber;         // 연관된 주식 계좌 번호
    private Long stockProductId;             // 보유한 주식 상품 ID
    private String stockProductName;         // 주식 종목명
    private Integer stockHoldingQuantity;    // 보유 주식 수량
    private BigDecimal stockHoldingAvgPrice; // 평균 매입가
    private LocalDateTime stockHoldingAcquiredAt; // 매입 일자
    private BigDecimal stockClosingPrice;    // 현재가
    private BigDecimal stockFluctuationRate;
}
package com.moneytree_back.dto.financialProduct;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockProductDTO {

    private Long stockProductId; // 기본 키
    private LocalDate stockProductBaseDate; // 기준일자
    private String stockProductName; // 종목명
    private String stockMarketCategory; // 시장구분 (KOSPI, KOSDAQ 등)
    private BigDecimal stockClosingPrice; // 종가 (마감 가격)
    private BigDecimal stockPriceDifference; // 전일 대비 가격 변화
    private BigDecimal stockFluctuationRate; // 등락률 (%)
    private BigDecimal stockOpeningPrice; // 시가 (시작 가격)
    private BigDecimal stockHighestPrice; // 고가 (최고 가격)
    private BigDecimal stockLowestPrice; // 저가 (최저 가격)
    private Long stockTradingVolume; // 거래량
    private BigDecimal stockTradingValue; // 거래대금
    private BigDecimal stockMarketCapitalization; // 시가총액

}

package com.moneytree_back.domain.financialProduct;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "stock_product")
public class StockProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_product_id", updatable = false, nullable = false)
    private Long stockProductId; // 기본 키

    @Column(name = "stock_product_base_date", nullable = false)
    private LocalDate stockProductBaseDate; // 기준일자

    @Column(name = "stock_product_name", nullable = false)
    private String stockProductName; // 종목명

    @Column(name = "stock_market_category", nullable = false)
    private String stockMarketCategory; // 시장구분 (KOSPI, KOSDAQ 등)

    @Column(name = "stock_closing_price", precision = 15, scale = 2)
    private BigDecimal stockClosingPrice; // 종가 (마감 가격)

    @Column(name = "stock_price_difference", precision = 15, scale = 2)
    private BigDecimal stockPriceDifference; // 전일 대비 가격 변화

    @Column(name = "stock_fluctuation_rate", precision = 7, scale = 2)
    private BigDecimal stockFluctuationRate; // 등락률 (%)

    @Column(name = "stock_opening_price", precision = 15, scale = 2)
    private BigDecimal stockOpeningPrice; // 시가 (시작 가격)

    @Column(name = "stock_highest_price", precision = 15, scale = 2)
    private BigDecimal stockHighestPrice; // 고가 (최고 가격)

    @Column(name = "stock_lowest_price", precision = 15, scale = 2)
    private BigDecimal stockLowestPrice; // 저가 (최저 가격)

    @Column(name = "stock_trading_volume")
    private Long stockTradingVolume; // 거래량

    @Column(name = "stock_trading_value", precision = 20, scale = 2)
    private BigDecimal stockTradingValue; // 거래대금

    @Column(name = "stock_market_capitalization", precision = 20, scale = 2)
    private BigDecimal stockMarketCapitalization; // 시가총액
}

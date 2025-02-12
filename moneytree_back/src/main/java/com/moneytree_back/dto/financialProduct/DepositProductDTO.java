package com.moneytree_back.dto.financialProduct;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepositProductDTO {

    private Long depositProductId;
    private String depositProductName;
    private String bankName;
    private String depositJoinWay;
    private BigDecimal depositMinAmount;
    private Integer depositMaturityPeriod;
    private String depositInterestRateType;
    private BigDecimal depositBaseInterestRate;
    private BigDecimal depositPrimeInterestRate;
    private LocalDateTime depositProductCreatedAt;
    private LocalDateTime depositProductUpdatedAt;

}

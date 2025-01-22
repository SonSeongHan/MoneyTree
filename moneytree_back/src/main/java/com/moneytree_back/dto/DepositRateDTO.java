package com.moneytree_back.dto;

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
public class DepositRateDTO {

    private Long depositRateId;
    private Long depositProductId;
    private BigDecimal depositInterestRate; // 기본
    private BigDecimal depositSpecialRate;
    private String depositCondition;
    private String depositRateDescription;
    private LocalDateTime depositRateCreatedAt;
    private LocalDateTime depositRateUpdatedAt;
}

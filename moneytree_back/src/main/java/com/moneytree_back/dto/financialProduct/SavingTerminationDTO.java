package com.moneytree_back.dto.financialProduct;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingTerminationDTO {
    private Long savingTerminationId;
    private LocalDateTime savingTerminationDate;
    private String savingTerminationReason;
    private BigDecimal savingPenaltyFee;
    private BigDecimal savingServiceFee;
    private BigDecimal savingRefundAmount;
    private Long savingAccountNumber;
}
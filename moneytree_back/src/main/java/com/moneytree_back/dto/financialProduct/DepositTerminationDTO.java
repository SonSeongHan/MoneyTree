package com.moneytree_back.dto.financialProduct;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepositTerminationDTO {
    private Long depositTerminationId;
    private LocalDateTime depositTerminationDate;
    private String depositTerminationReason;
    private BigDecimal depositPenaltyFee;
    private BigDecimal depositServiceFee;
    private BigDecimal depositRefundAmount;
    private Long depositAccountNumber;
}
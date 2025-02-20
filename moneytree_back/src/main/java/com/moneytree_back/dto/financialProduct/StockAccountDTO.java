package com.moneytree_back.dto.financialProduct;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAccountDTO {
    private Long stockAccountNumber; // 주식 계좌 번호
    private BigDecimal stockAccountBalance; // 주식 계좌 잔액
    private LocalDateTime stockAccountCreatedAt; // 주식 계좌 생성일
    private String dandwAcId; // 연관된 입출금 계좌 ID
}
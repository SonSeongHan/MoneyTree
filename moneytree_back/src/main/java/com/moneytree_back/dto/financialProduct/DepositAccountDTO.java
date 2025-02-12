package com.moneytree_back.dto.financialProduct;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepositAccountDTO {
    private Long depositAccountNumber; // 예금 계좌 번호
    private String formattedAccountNumber;
    private BigDecimal depositAmount; // 가입 금액
    private LocalDate depositStartDate; // 가입 시작일
    private LocalDate depositEndDate; // 만기일
    private Long depositProductId; // 예금 상품 ID (DepositProduct와 매핑) // 예금 상품 ID
    private String dandwAcId; // 입출금 계좌 ID
    private BigDecimal regularPaymentAmount; // 정기 납입액
    private Integer regularPaymentDay; // 정기 납입일
    private Boolean isRegularPayment; // 정기 납입 여부
    private LocalDate lastPaymentDate; // 마지막 납입일
}
package com.moneytree_back.dto.financialProduct;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingAccountDTO {
    private Long savingAccountNumber; // 적금 계좌 번호
    private String formattedAccountNumber; // 포맷된 계좌 번호
    private BigDecimal savingDepositAmount; // 가입 시 설정한 첫 납입 금액
    private LocalDate savingStartDate; // 적금 가입일
    private LocalDate savingEndDate; // 적금 만기일
    private Long savingProductId; // 적금 상품 ID (SavingProduct와 매핑)
    private String dandwAcId; // 입출금 계좌 ID
    private BigDecimal savingRegularPaymentAmount; // 정기 납입 금액 (변경 불가)
    private Integer savingRegularPaymentDay; // 정기 납입일 (매월 1~28일)
    private Boolean isSavingRegularPayment; // 정기 납입 여부 (항상 true)
    private LocalDate lastSavingPaymentDate; // 마지막 납입일
}

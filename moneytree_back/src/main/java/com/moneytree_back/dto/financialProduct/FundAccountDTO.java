package com.moneytree_back.dto.financialProduct;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FundAccountDTO {
    private Long fundAccountNumber; // 펀드 계좌 ID
    private BigDecimal fundInvestmentAmount; // 투자 금액
    private LocalDate fundInvestmentDate; // 투자 날짜
    private LocalDate fundMaturityDate; // 만기일
    private BigDecimal fundExpectedReturn; // 예상 수익률
    private String fundStatus; // 펀드 상태 (운용 중, 만기, 해지됨 등)
    private Long fundProductId; // 연관된 펀드 상품 ID
    private String dandwAcId; // 연관된 입출금 계좌 ID
    private String fundProductName;
    private String fundProductType;
}

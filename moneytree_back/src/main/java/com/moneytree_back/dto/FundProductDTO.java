package com.moneytree_back.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FundProductDTO {

    private Long fundProductId; // 펀드 상품 ID
    private String fundProductYear; // 펀드 연도
    private String fundProductType; // 펀드 유형
    private String fundProductManager; // 펀드 운용사
    private String fundProductName; // 펀드 이름
    private LocalDate fundProductExpiration; // 펀드 만기일
    private BigDecimal fundProductTotalAmount; // 펀드 총 규모
    private BigDecimal fundProductManagementFee; // 운용 보수
    private BigDecimal fundProductRedemptionFee; // 환매 수수료

}

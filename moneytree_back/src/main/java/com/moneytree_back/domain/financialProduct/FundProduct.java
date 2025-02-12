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
@Table(name = "fund_product")
public class FundProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fund_product_id", updatable = false, nullable = false)
    private Long fundProductId; // 펀드 상품 ID

    @Column(name = "fund_product_year")
    private String fundProductYear; // 펀드 연도

    @Column(name = "fund_product_type")
    private String fundProductType; // 펀드 유형

    @Column(name = "fund_product_manager")
    private String fundProductManager; // 펀드 운용사

    @Column(name = "fund_product_name")
    private String fundProductName;  // 펀드 이름

    @Column(name = "fund_product_expiration")
    private LocalDate fundProductExpiration; // 펀드 만기일

    @Column(name = "fund_product_total_amount", precision = 15, scale = 2)
    private BigDecimal fundProductTotalAmount; // 펀드 총 규모

    @Column(name = "fund_product_management_fee", precision = 5, scale = 2)
    private BigDecimal fundProductManagementFee; // 운용 보수

    @Column(name = "fund_product_redemption_fee", precision = 5, scale = 2)
    private BigDecimal fundProductRedemptionFee; // 환매 수수료
}
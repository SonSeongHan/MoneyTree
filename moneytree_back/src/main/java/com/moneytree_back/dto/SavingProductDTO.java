package com.moneytree_back.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingProductDTO {

    private Long savingProductId; // 기본 키
    private Integer savingMaturityPeriod; // 적금 만기
    private String savingProductName; // 적금 상품명
    private String savingBankName; // 은행명
    private String savingJoinWay; // 가입 방법
    private BigDecimal savingMinAmount; // 최소 가입 금액
    private BigDecimal savingMaxAmount; // 최대 가입 금액
    private String savingInterestRateType; // 이율 유형 (단리, 복리)
    private BigDecimal savingBaseInterestRate; // 기본 이자율
    private BigDecimal savingPrimeInterestRate; // 최고 우대 이자율
    private LocalDateTime savingProductCreatedAt; // 생성 일자
    private LocalDateTime savingProductUpdatedAt; // 수정 일자
}

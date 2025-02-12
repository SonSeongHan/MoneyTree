package com.moneytree_back.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

/**
 * 충전(입금) 요청 DTO
 */
@Getter
@Setter
public class DepositRequestDTO {

    @NotBlank(message = "회원 ID는 필수입니다.")
    private String memberId;

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;

    @NotNull(message = "충전 금액은 필수입니다.")
    @DecimalMin(value = "1", message = "충전 금액은 1원 이상이어야 합니다.")
    private BigDecimal amount;

    // ✅ 충전 목적
    private String depositPurpose;
}

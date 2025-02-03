package com.moneytree_back.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 *  로그인된 사용자(memberId) → 이 DTO를 이용해
 *   - receiverAccountId: 수신자 계좌
 *   - password: 송금자 비밀번호
 *   - amount: 송금 금액
 */
@Getter @Setter
public class TransferRequestDTO {

    @NotBlank
    private String senderMemberId;    // ★ 여기에 로그인 사용자 ID를 직접 담아 전송

    @NotBlank
    private String receiverAccountId; // 수신자 계좌번호

    @NotBlank
    private String password;          // 송금자 비밀번호

    @NotNull
    @DecimalMin(value = "1.0")
    private BigDecimal amount;
}

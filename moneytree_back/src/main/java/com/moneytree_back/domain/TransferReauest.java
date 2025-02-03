package com.moneytree_back.domain;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;


@Getter
@Setter
@ToString
public class TransferReauest {
    @NotBlank(message = "송신자 계좌 ID는 필수입니다.")
    private String senderAccountId;

    @NotBlank(message = "수신자 계좌 ID는 필수입니다.")
    private String receiverAccountId;

    @NotNull(message = "전송 금액은 필수입니다.")
    @DecimalMin(value = "1.0", inclusive = true, message = "전송 금액은 1 이상이어야 합니다.")
    private BigDecimal amount;

}

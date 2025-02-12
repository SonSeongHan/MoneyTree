package com.moneytree_back.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferRequestDTO {
    private String senderMemberId;     // 송금자(내) 회원ID
    private String receiverAccountId;  // 받는 계좌번호
    private BigDecimal amount;
    private String password;
    private String depositPurpose;

    // 닉네임/이름을 from/toMemberName로 통일
    private String fromMemberName;     // 보내는 사람 닉네임(이름)
    private String toMemberName;       // 받는 사람 닉네임(이름)
}

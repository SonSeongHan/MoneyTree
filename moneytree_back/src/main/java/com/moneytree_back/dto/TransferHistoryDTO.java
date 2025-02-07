package com.moneytree_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferHistoryDTO {
    private Long id;
    private String transactionType;
    private double amount;
    private LocalDateTime createdAt;
    private String fromMemberName;  // 송금한 회원 이름
    private String toMemberName;    // 입금받은 회원 이름
}

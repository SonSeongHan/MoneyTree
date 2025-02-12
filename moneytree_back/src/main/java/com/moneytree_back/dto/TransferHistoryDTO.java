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
    private String fromMemberName;  // 여기로 변경
    private String toMemberName;    // 여기로 변경
}

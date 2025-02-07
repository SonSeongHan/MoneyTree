// MemberDetailResponseDTO.java
package com.moneytree_back.dto;

import com.moneytree_back.domain.TransactionHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class MemberDetailResponseDTO {
    private String memberId;
    private BigDecimal balance;
    private List<String> subscribedProducts;
    private List<String> hobbies;
    private List<TransferHistoryDTO> transferHistory;

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    public static class TransferHistoryDTO {
        private Long id;
        private String transactionType;  // 혹은 dandwacType
        private String amount;
        private LocalDateTime createdAt;
    }
}

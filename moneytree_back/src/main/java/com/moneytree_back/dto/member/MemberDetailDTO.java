package com.moneytree_back.dto.member;

import com.moneytree_back.dto.TransferHistoryDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberDetailDTO {
    private String memberId;
    private int balance;
    private List<String> subscribedProducts;
    private List<String> hobbies;
    private List<TransferHistoryDTO> transferHistory;
}

package com.moneytree_back.service;

import com.moneytree_back.dto.TransferHistoryDTO;
import java.util.List;

public interface TransactionHistoryService {

    List<TransferHistoryDTO> getTransactionsForMember(String memberId, int months);
}

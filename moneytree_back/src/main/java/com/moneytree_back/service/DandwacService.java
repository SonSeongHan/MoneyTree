package com.moneytree_back.service;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.dto.DandwacDTO;

public interface DandwacService {

    Dandwac createAccount(DandwacDTO dandwacDTO);

    /**
     * 특정 계좌 조회
     */
    Dandwac getAccount(String dandwAcId);
}

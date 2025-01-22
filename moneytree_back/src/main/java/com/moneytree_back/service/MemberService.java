package com.moneytree_back.service;

import com.moneytree_back.domain.Member;
import com.moneytree_back.dto.MemberDTO;

public interface MemberService {
    Member createMember(MemberDTO memberDTO);

    Member modifyMember(String id, MemberDTO memberDTO);
    Member login(MemberDTO loginDTO); // 로그인 로직
}

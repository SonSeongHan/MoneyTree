package com.moneytree_back.login.service;

import com.moneytree_back.login.domain.Member;
import com.moneytree_back.login.dto.MemberDTO;

public interface MemberService {
    Member createMember(MemberDTO memberDTO);

    Member modifyMember(String id, MemberDTO memberDTO);
    Member login(MemberDTO loginDTO); // 로그인 로직
}

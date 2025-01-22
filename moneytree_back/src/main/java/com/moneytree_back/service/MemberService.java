package com.moneytree_back.service;

import com.moneytree_back.domain.Member;
import com.moneytree_back.dto.MemberDTO;

public interface MemberService {
    Member createMember(MemberDTO memberDTO);

    Member modifyMember(String id, MemberDTO memberDTO);

    // 로그인 로직 - 회원 타입(간편/정회원)에 따라 분기
    Member login(MemberDTO loginDTO);
}

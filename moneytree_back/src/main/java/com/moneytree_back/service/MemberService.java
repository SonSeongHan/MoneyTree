package com.moneytree_back.service;

import com.moneytree_back.domain.Member;
import com.moneytree_back.dto.MemberDTO;

public interface MemberService {

    /**
     * 회원 가입
     *
     * @param memberDTO 가입에 필요한 정보
     * @return 생성된 Member 엔티티
     */
    Member createMember(MemberDTO memberDTO);

    // 필요한 메서드를 계속 추가할 수 있음 (ex. findMember, updateMember, deleteMember 등)
}

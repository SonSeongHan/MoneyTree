package com.moneytree_back.service;

import com.moneytree_back.domain.Member;
import com.moneytree_back.dto.MemberDTO;
import org.springframework.stereotype.Service;

@Service
public interface MemberService {
    Member createMember(MemberDTO memberDTO);

    Member modifyMember(String id, MemberDTO memberDTO);

    boolean changePassword(String memberId, String currentPassword, String newPassword);

    boolean changeMemberName(String currentId, String newId, String password);

}

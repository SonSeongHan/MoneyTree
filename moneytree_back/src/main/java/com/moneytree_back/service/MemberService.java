package com.moneytree_back.service;

import com.moneytree_back.domain.Member;
import com.moneytree_back.dto.MemberDTO;
import com.moneytree_back.dto.TransferHistoryDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface MemberService {
    Member createMember(MemberDTO memberDTO);

    Member modifyMember(String id, MemberDTO memberDTO);

    boolean changePassword(String memberId, String currentPassword, String newPassword);

    boolean changeMemberName(String currentId, String newId, String password);

    // 기존 로그인 로직
//    Member login(MemberDTO loginDTO);

    // *** 추가된 메서드 ***
    List<Member> getAllMembers();
    Member getMemberById(String memberId);
//    List<TransferHistoryDTO> getPaymentRecords(String memberId);
void withdrawMember(String memberId, String withdrawalReason);
    boolean reactivateMember(String memberId, String password);

}


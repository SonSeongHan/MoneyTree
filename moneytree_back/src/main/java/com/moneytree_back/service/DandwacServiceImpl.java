package com.moneytree_back.service;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.Member;
import com.moneytree_back.domain.MembershipType;
import com.moneytree_back.dto.DandwacDTO;
import com.moneytree_back.repository.DandwacRepository;
import com.moneytree_back.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DandwacServiceImpl implements DandwacService {

    private final DandwacRepository dandwAccountRepository;
    private final MemberRepository memberRepository; // Member 엔티티용 Repository

    @Override
    public Dandwac createAccount(DandwacDTO dto) {
        // 1) Member 엔티티 조회
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원 ID입니다."));

        // 2) Dandwac 엔티티 생성
        Dandwac account = new Dandwac();
        account.setDandwAcId(dto.getDandwAcId());
        account.setMember(member);
        account.setAccountType(dto.getAccountType());
        account.setBalance(dto.getBalance());
        account.setAccountPassword(dto.getAccountPassword());
        account.setCreatedAt(LocalDate.now());

        // 3) 계좌 저장
        dandwAccountRepository.save(account);

        // 4) Member 엔티티의 계좌번호 업데이트
        member.setMember_accountNumber(account.getDandwAcId());
        member.setMembershipType(MembershipType.FullMember); // 회원 유형 변경
        memberRepository.save(member);

        return account;
    }


    @Override
    public Dandwac getAccount(String dandwAcId) {
        return dandwAccountRepository.findById(dandwAcId)
                .orElseThrow(() -> new IllegalArgumentException("해당 계좌를 찾을 수 없습니다."));
    }
}

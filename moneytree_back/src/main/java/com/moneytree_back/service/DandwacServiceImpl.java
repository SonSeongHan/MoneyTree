package com.moneytree_back.service;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.Member;
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
        // 1) member_id로 Member 엔티티 조회
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원 ID입니다."));

        // 2) DandwAccount 엔티티 생성
        Dandwac account = new Dandwac();
        account.setDandwAcId(dto.getDandwAcId());
        account.setMember(member);
        account.setAccountType(dto.getAccountType() != null ? dto.getAccountType() : /*기본값*/ null);
        account.setBalance(dto.getBalance());
        // 실제 서비스에서는 비밀번호 암호화 로직을 추가하는 것을 권장 (BCrypt 등)
        account.setAccountPassword(dto.getAccountPassword());
        account.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDate.now());

        // 3) 저장
        return dandwAccountRepository.save(account);
    }

    @Override
    public Dandwac getAccount(String dandwAcId) {
        return dandwAccountRepository.findById(dandwAcId)
                .orElseThrow(() -> new IllegalArgumentException("해당 계좌를 찾을 수 없습니다."));
    }
}

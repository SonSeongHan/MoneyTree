package com.moneytree_back.service;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.Member;
import com.moneytree_back.domain.MembershipType;
import com.moneytree_back.dto.DandwacDTO;
import com.moneytree_back.repository.DandwacRepository;
import com.moneytree_back.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DandwacServiceImpl implements DandwacService {

    private final DandwacRepository dandwAccountRepository;
    private final MemberRepository memberRepository;

    @Override
    public Dandwac createAccount(DandwacDTO dto) {
        // (1) Member 엔티티 조회
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원 ID입니다."));

        // (2) Dandwac 엔티티 생성
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

        // (3) 계좌 저장
        dandwAccountRepository.save(account);

        // (4) Member 업데이트
        member.setMember_accountNumber(account.getDandwAcId());
        member.setMembershipType(MembershipType.FullMember);
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

    @Override
    public Dandwac findAccountByMemberId(String memberId) {
        return dandwAccountRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원의 계좌를 찾을 수 없습니다."));
    }

    /**
     * 송금 (내 계좌 → 입력된 receiverAccountId 계좌)
     */
    @Transactional
    @Override
    public void transferMoney(String memberId,
                              String receiverAccountId,
                              BigDecimal amount,
                              String password) {
        // (1) 송금자 계좌 조회(=내 계좌)
        Dandwac senderAccount = dandwAccountRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new IllegalArgumentException("송금자 계좌를 찾을 수 없습니다."));

        // (2) 비밀번호 확인
        if (!senderAccount.getAccountPassword().equals(password)) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        // (3) 수신자 계좌
        Dandwac receiverAccount = dandwAccountRepository.findById(receiverAccountId)
                .orElseThrow(() -> new IllegalArgumentException("수신자 계좌를 찾을 수 없습니다."));

        // (4) 잔액 차감 & 추가
        if (senderAccount.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("잔액이 부족합니다.");
        }
        senderAccount.setBalance(senderAccount.getBalance().subtract(amount));
        receiverAccount.setBalance(receiverAccount.getBalance().add(amount));

        dandwAccountRepository.save(senderAccount);
        dandwAccountRepository.save(receiverAccount);
    }

}

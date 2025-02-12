package com.moneytree_back.service;

import com.moneytree_back.domain.Member;
import com.moneytree_back.domain.WithdrawnMember;
import com.moneytree_back.repository.MemberRepository;
import com.moneytree_back.repository.WithdrawnMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;


@Component
@Log4j2
@RequiredArgsConstructor
public class WithdrawalCleanupScheduler {

    private final MemberRepository memberRepository;
    private final WithdrawnMemberRepository withdrawnMemberRepository;

    // 매 1분마다 실행 (60000ms)
    @Scheduled(fixedDelay = 60000)
    public void cleanupWithdrawnMembers() {
        // 현재 시각 기준 1분 이전에 탈퇴 처리된 회원 조회
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(1);
        log.info("Scheduler invoked at {}. Threshold time: {}", LocalDateTime.now(), threshold);

        List<Member> membersToDelete = memberRepository.findByActiveFalseAndWithdrawalDateBefore(threshold);
        log.info("Found {} members to delete.", membersToDelete.size());

        for (Member member : membersToDelete) {
            log.info("Deleting member {}. WithdrawalDate: {}, Current time: {}",
                    member.getMemberId(), member.getWithdrawalDate(), LocalDateTime.now());

            // WithdrawnMember 엔티티 생성 및 저장
            WithdrawnMember withdrawnMember = WithdrawnMember.builder()
                    .memberId(member.getMemberId())
                    .memberName(member.getMemberName())
                    .residentRegistrationNumber(member.getResidentRegistrationNumber())
                    .memberpassword(member.getMemberpassword())
                    .member_age(member.getMember_age())
                    .memberPhoneNumber(member.getMemberPhoneNumber())
                    .member_address(member.getMember_address())
                    .membershipType(member.getMembershipType())
                    .member_accountNumber(member.getMember_accountNumber())
                    .member_job(member.getMember_job())
                    .member_creditScore(member.getMember_creditScore())
                    .member_created_day(member.getMember_created_day())
                    .withdrawalDate(member.getWithdrawalDate())
                    .withdrawalReason(member.getWithdrawalReason())
                    .build();

            withdrawnMemberRepository.save(withdrawnMember);
            // Member DB에서 해당 회원 정보 완전 삭제
            memberRepository.delete(member);
            log.info("Member {} deleted and stored in WithdrawnMember.", member.getMemberId());
        }
    }
}


package com.moneytree_back.domain;

import com.moneytree_back.domain.member.Member;
import com.moneytree_back.domain.member.MembershipType;
import com.moneytree_back.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor  // 생성자 주입을 위해 lombok의 어노테이션 사용
public class AdminDataInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;

    @Override
    public void run(String... args) throws Exception {
        // 관리자 계정: ID: admin@admin, 비밀번호: 123456, MembershipType: ADMIN
        // 여기에 계좌번호 110-23-123-456, 계좌 비밀번호 12345678 을 추가합니다.
        if (!memberRepository.existsById("admin@admin")) {
            Member admin = Member.builder()
                    .memberId("admin@admin")
                    .memberpassword("123456")
                    .membershipType(MembershipType.ADMIN)
                    .member_created_day(LocalDateTime.now())
                    .member_accountNumber("110-23-123-456")   // 추가된 계좌번호
                    .build();
            memberRepository.save(admin);
        }

        // 나머지 관리자(펀드 매니저, 대출 매니저 등) 계정은 기존대로 생성
        if (!memberRepository.existsById("fundManager@fundManager")) {
            Member fundManager = Member.builder()
                    .memberId("fundManager@fundManager")
                    .memberpassword("123456")
                    .membershipType(MembershipType.FundManager)
                    .member_created_day(LocalDateTime.now())
                    .build();
            memberRepository.save(fundManager);
        }

        if (!memberRepository.existsById("loanManager@loanManager")) {
            Member loanManager = Member.builder()
                    .memberId("loanManager@loanManager")
                    .memberpassword("123456")
                    .membershipType(MembershipType.LoanManager)
                    .member_created_day(LocalDateTime.now())
                    .build();
            memberRepository.save(loanManager);
        }

        if (!memberRepository.existsById("realEstateManager@realEstateManager")) {
            Member realEstateManager = Member.builder()
                    .memberId("realEstateManager@realEstateManager")
                    .memberpassword("123456")
                    .membershipType(MembershipType.RealEstateManager)
                    .member_created_day(LocalDateTime.now())
                    .build();
            memberRepository.save(realEstateManager);
        }

        if (!memberRepository.existsById("inquiryManager@inquiryManager")) {
            Member inquiryManager = Member.builder()
                    .memberId("inquiryManager@inquiryManager")
                    .memberpassword("123456")
                    .membershipType(MembershipType.InquiryManager)
                    .member_created_day(LocalDateTime.now())
                    .build();
            memberRepository.save(inquiryManager);
        }

        if (!memberRepository.existsById("communityManager@communityManager")) {
            Member communityManager = Member.builder()
                    .memberId("communityManager@communityManager")
                    .memberpassword("123456")
                    .membershipType(MembershipType.CommunityManager)
                    .member_created_day(LocalDateTime.now())
                    .build();
            memberRepository.save(communityManager);
        }
    }
}

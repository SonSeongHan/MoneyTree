package com.moneytree_back.domain;

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
        if (!memberRepository.existsById("admin@admin")) {
            Member admin = Member.builder()
                    .memberId("admin@admin")
                    .memberpassword("123456")
                    .membershipType(MembershipType.ADMIN)
                    .member_created_day(LocalDateTime.now())
                    .build();
            memberRepository.save(admin);
        }

        // 펀드 매니저 계정
        if (!memberRepository.existsById("fundManager@fundManager")) {
            Member fundManager = Member.builder()
                    .memberId("fundManager@fundManager")
                    .memberpassword("123456")
                    .membershipType(MembershipType.FundManager)
                    .member_created_day(LocalDateTime.now())
                    .build();
            memberRepository.save(fundManager);
        }

        // 대출 매니저 계정
        if (!memberRepository.existsById("loanManager@loanManager")) {
            Member loanManager = Member.builder()
                    .memberId("loanManager@loanManager")
                    .memberpassword("123456")
                    .membershipType(MembershipType.LoanManager)
                    .member_created_day(LocalDateTime.now())
                    .build();
            memberRepository.save(loanManager);
        }

        // 부동산 매니저 계정
        if (!memberRepository.existsById("realEstateManager@realEstateManager")) {
            Member realEstateManager = Member.builder()
                    .memberId("realEstateManager@realEstateManager")
                    .memberpassword("123456")
                    .membershipType(MembershipType.RealEstateManager)
                    .member_created_day(LocalDateTime.now())
                    .build();
            memberRepository.save(realEstateManager);
        }

        // 문의 매니저 계정
        if (!memberRepository.existsById("inquiryManager@inquiryManager")) {
            Member inquiryManager = Member.builder()
                    .memberId("inquiryManager@inquiryManager")
                    .memberpassword("123456")
                    .membershipType(MembershipType.InquiryManager)
                    .member_created_day(LocalDateTime.now())
                    .build();
            memberRepository.save(inquiryManager);
        }

        // 커뮤니티 매니저 계정
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

package com.moneytree_back.service;

import com.moneytree_back.domain.Member;
import com.moneytree_back.domain.MembershipType;
import com.moneytree_back.dto.MemberDTO;
import com.moneytree_back.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;

    @Override
    public Member createMember(MemberDTO memberDTO) {
        // 1. member_id 중복 검사
        if (memberRepository.existsByMemberId(memberDTO.getMember_id())) {
            throw new IllegalArgumentException("이미 사용 중인 member_id입니다.");
        }

        // 2. 주민등록번호 중복 검사
        if (memberDTO.getResidentRegistrationNumber() != null
                && !memberDTO.getResidentRegistrationNumber().isBlank()) {
            if (memberRepository.existsByResidentRegistrationNumber(memberDTO.getResidentRegistrationNumber())) {
                throw new IllegalArgumentException("이미 가입된 주민등록번호입니다.");
            }
        }

        // 3. 전화번호 중복 검사
        if (memberRepository.existsByMemberPhoneNumber(memberDTO.getMember_phoneNumber())) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }

        // 4. DTO -> Entity 변환
        Member member = new Member();
        member.setMemberId(memberDTO.getMember_id());
        member.setMember_name(memberDTO.getMember_name());
        member.setResidentRegistrationNumber(memberDTO.getResidentRegistrationNumber());
        member.setMemberpassword(memberDTO.getMember_password());
        member.setMemberPhoneNumber(memberDTO.getMember_phoneNumber());
        member.setMember_job(memberDTO.getMember_job());
        member.setMember_creditScore(memberDTO.getMember_creditScore());
        member.setMember_created_day(LocalDateTime.now());

        // 주민등록번호 검증 (정회원일 경우)
        if (memberDTO.getResidentRegistrationNumber() != null
                && !memberDTO.getResidentRegistrationNumber().isBlank()) {
            String rrn = memberDTO.getResidentRegistrationNumber();
            if (rrn.length() != 13) {
                throw new IllegalArgumentException("주민등록번호는 13자리여야 합니다.");
            }
            member.setResidentRegistrationNumber(rrn);
        }

        // 계좌 정보에 따라 회원 유형 결정 (null or empty이면 SimpleMember)
        if (memberDTO.getAccountNumber() == null || memberDTO.getAccountNumber().isEmpty()) {
            member.setMembershipType(MembershipType.SimpleMember);
        } else {
            member.setMembershipType(MembershipType.FullMember);
        }

        // 회원 나이 계산 (주민등록번호가 있을 경우)
        if (member.getResidentRegistrationNumber() != null && !member.getResidentRegistrationNumber().isBlank()) {
            member.setMember_age(calculateAgeFromRRN(member.getResidentRegistrationNumber()));
        }

        // 정회원 검증 (주소 필수)
        if (member.getMembershipType() == MembershipType.FullMember) {
            if (memberDTO.getMember_address() == null || memberDTO.getMember_address().isEmpty()) {
                throw new IllegalArgumentException("정회원(FullMember)은 주소가 필수입니다.");
            }
        }
        member.setMember_address(memberDTO.getMember_address());

        // 5. DB 저장
        return memberRepository.save(member);
    }

    @Override
    public Member modifyMember(String id, MemberDTO memberDTO) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("회원 ID를 찾을 수 없습니다."));

        member.setMember_name(memberDTO.getMember_name());
        member.setMember_address(memberDTO.getMember_address());
        member.setMemberPhoneNumber(memberDTO.getMember_phoneNumber());
        member.setMember_job(memberDTO.getMember_job());
        member.setMember_creditScore(memberDTO.getMember_creditScore());

        return memberRepository.save(member);
    }

    /**
     * 로그인 로직
     * - membershipType에 따라 분기: FullMember vs SimpleMember
     * - 정회원(FullMember): 주민등록번호 + 비밀번호
     * - 간편회원(SimpleMember): 아이디 + 비밀번호
     */
    @Override
    public Member login(MemberDTO loginDTO) {
        // membershipType 자체가 enum
        MembershipType type = loginDTO.getMembershipType();

        // 비밀번호 검증
        if (loginDTO.getMember_password() == null || loginDTO.getMember_password().isBlank()) {
            throw new IllegalArgumentException("비밀번호는 필수 입력 항목입니다.");
        }

        // 정회원(FullMember)
        if (type == MembershipType.FullMember) {
            if (loginDTO.getResidentRegistrationNumber() == null
                    || loginDTO.getResidentRegistrationNumber().isBlank()) {
                throw new IllegalArgumentException("정회원은 주민등록번호를 입력해야 합니다.");
            }
            if (loginDTO.getResidentRegistrationNumber().length() != 13) {
                throw new IllegalArgumentException("주민등록번호는 13자리여야 합니다.");
            }
            // DB 조회
            return memberRepository.findByResidentRegistrationNumberAndMemberpassword(
                    loginDTO.getResidentRegistrationNumber(),
                    loginDTO.getMember_password()
            ).orElseThrow(() -> new IllegalArgumentException("로그인 정보가 올바르지 않습니다."));

            // 간편회원(SimpleMember)
        } else if (type == MembershipType.SimpleMember) {
            if (loginDTO.getMember_id() == null || loginDTO.getMember_id().isBlank()) {
                throw new IllegalArgumentException("간편회원은 아이디(member_id)를 입력해야 합니다.");
            }
            // DB 조회
            return memberRepository.findByMemberIdAndMemberpassword(
                    loginDTO.getMember_id(),
                    loginDTO.getMember_password()
            ).orElseThrow(() -> new IllegalArgumentException("로그인 정보가 올바르지 않습니다."));

        } else {
            // 혹은 enum에 더 많은 타입이 있다면 나머지 처리
            throw new IllegalArgumentException("유효하지 않은 회원 타입입니다.");
        }
    }


    // 주민등록번호를 바탕으로 나이 계산
    private Integer calculateAgeFromRRN(String rrn) {
        String yearStr = rrn.substring(0, 2);
        String monthStr = rrn.substring(2, 4);
        String dayStr = rrn.substring(4, 6);
        char genderCode = rrn.charAt(6);

        int year = Integer.parseInt(yearStr);
        int month = Integer.parseInt(monthStr);
        int day = Integer.parseInt(dayStr);

        // 성별에 따라 1900 혹은 2000년대 결정
        if (genderCode == '1' || genderCode == '2') {
            year += 1900;
        } else if (genderCode == '3' || genderCode == '4') {
            year += 2000;
        } else {
            year += 1900;
        }

        LocalDate birthDate = LocalDate.of(year, month, day);
        return Period.between(birthDate, LocalDate.now()).getYears();
    }
}

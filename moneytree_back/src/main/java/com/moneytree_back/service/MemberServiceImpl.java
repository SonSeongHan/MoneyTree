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
        if (memberRepository.existsByMemberId(memberDTO.getMemberId())) {
            throw new IllegalArgumentException("이미 사용 중인 member_id입니다.");
        }

        // 2. 주민등록번호 중복 검사
        if (memberRepository.existsByResidentRegistrationNumber(memberDTO.getResidentRegistrationNumber())) {
            throw new IllegalArgumentException("이미 가입된 주민등록번호입니다.");
        }

        // 3. 전화번호 중복 검사
        if (memberRepository.existsByMemberPhoneNumber(memberDTO.getMember_phoneNumber())) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }

        // 4. DTO -> Entity 변환
        Member member = new Member();
        member.setMemberId(memberDTO.getMemberId());
        member.setMember_name(memberDTO.getMember_name());
        member.setResidentRegistrationNumber(memberDTO.getResidentRegistrationNumber());
        member.setMemberpassword(memberDTO.getMemberpassword());
        member.setMemberPhoneNumber(memberDTO.getMember_phoneNumber());
        member.setMember_job(memberDTO.getMember_job());
        member.setMember_creditScore(memberDTO.getMember_creditScore());
        member.setMember_created_day(LocalDateTime.now());

        // 주민등록번호 검증 (길이 확인)
        String rrn = memberDTO.getResidentRegistrationNumber();
        if (rrn == null || rrn.length() != 13) {
            throw new IllegalArgumentException("주민등록번호는 13자리여야 합니다.");
        }
        member.setResidentRegistrationNumber(rrn);

        // 계좌 정보에 따라 회원 유형 결정
        if (memberDTO.getAccountNumber() == null || memberDTO.getAccountNumber().isEmpty()) {
            member.setMembershipType(MembershipType.SimpleMember);
        } else {
            member.setMembershipType(MembershipType.FullMember);
        }

        // 회원 나이 계산
        member.setMember_age(calculateAgeFromRRN(rrn));

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

    // 비밀번호 변경 로직
    @Override
    public boolean changePassword(String memberId, String currentPassword, String newPassword) {
        // 1. 회원 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 ID를 찾을 수 없습니다."));

        // 2. 현재 비밀번호 확인
        if (!member.getMemberpassword().equals(currentPassword)) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다."); // 예외 발생
        }

        // 3. 새 비밀번호 유효성 체크
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("새 비밀번호가 유효하지 않습니다.");
        }

        // 4. 비밀번호 변경
        member.setMemberpassword(newPassword);
        memberRepository.save(member);

        return true;
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

    @Override
    public boolean changeMemberName(String memberId, String newName, String password) {
        // 1. 기존 회원 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 ID를 찾을 수 없습니다."));

        // 2. 현재 비밀번호 검증
        if (!member.getMemberpassword().equals(password)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 3. 이름 변경
        member.setMember_name(newName);
        memberRepository.save(member);

        return true;
    }



}

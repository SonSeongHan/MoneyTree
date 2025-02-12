package com.moneytree_back.service;

import com.moneytree_back.domain.Member;
import com.moneytree_back.domain.MembershipType;
import com.moneytree_back.domain.WithdrawnMember;
import com.moneytree_back.dto.MemberDTO;
import com.moneytree_back.dto.TransferHistoryDTO;
import com.moneytree_back.repository.MemberRepository;
import com.moneytree_back.repository.WithdrawnMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final WithdrawnMemberRepository withdrawnMemberRepository;

    @Override
    public Member createMember(MemberDTO memberDTO) {
        // 기존 로직 그대로...
        if (memberRepository.existsByMemberId(memberDTO.getMemberId())) {
            throw new IllegalArgumentException("이미 사용 중인 member_id입니다.");
        }
        if (memberRepository.existsByResidentRegistrationNumber(memberDTO.getResidentRegistrationNumber())) {
            throw new IllegalArgumentException("이미 가입된 주민등록번호입니다.");
        }
        if (memberRepository.existsByMemberPhoneNumber(memberDTO.getMember_phoneNumber())) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }

        Member member = new Member();
        member.setMemberId(memberDTO.getMemberId());
        member.setMemberName(memberDTO.getMember_name());
        member.setResidentRegistrationNumber(memberDTO.getResidentRegistrationNumber());
        member.setMemberpassword(memberDTO.getMemberpassword());
        member.setMemberPhoneNumber(memberDTO.getMember_phoneNumber());
        member.setMember_job(memberDTO.getMember_job());
        member.setMember_creditScore(memberDTO.getMember_creditScore());
        member.setMember_created_day(LocalDateTime.now());

        String rrn = memberDTO.getResidentRegistrationNumber();
        if (rrn == null || rrn.length() != 13) {
            throw new IllegalArgumentException("주민등록번호는 13자리여야 합니다.");
        }
        member.setResidentRegistrationNumber(rrn);

        if (memberDTO.getAccountNumber() == null || memberDTO.getAccountNumber().isEmpty()) {
            member.setMembershipType(MembershipType.SimpleMember);
        } else {
            member.setMembershipType(MembershipType.FullMember);
        }

        member.setMember_age(calculateAgeFromRRN(rrn));

        if (member.getMembershipType() == MembershipType.FullMember) {
            if (memberDTO.getMember_address() == null || memberDTO.getMember_address().isEmpty()) {
                throw new IllegalArgumentException("정회원(FullMember)은 주소가 필수입니다.");
            }
        }
        member.setMember_address(memberDTO.getMember_address());

        // 신규 회원은 기본적으로 active 상태(true)라고 가정
        member.setActive(true);

        return memberRepository.save(member);
    }

    @Override
    public Member modifyMember(String id, MemberDTO memberDTO) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("회원 ID를 찾을 수 없습니다."));
        member.setMemberName(memberDTO.getMember_name());
        member.setMember_address(memberDTO.getMember_address());
        member.setMemberPhoneNumber(memberDTO.getMember_phoneNumber());
        member.setMember_job(memberDTO.getMember_job());
        member.setMember_creditScore(memberDTO.getMember_creditScore());
        return memberRepository.save(member);
    }

    @Override
    public boolean changePassword(String memberId, String currentPassword, String newPassword) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 ID를 찾을 수 없습니다."));
        if (!member.getMemberpassword().equals(currentPassword)) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("새 비밀번호가 유효하지 않습니다.");
        }
        member.setMemberpassword(newPassword);
        memberRepository.save(member);
        return true;
    }

    @Override
    public boolean changeMemberName(String memberId, String newName, String password) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 ID를 찾을 수 없습니다."));
        if (!member.getMemberpassword().equals(password)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        member.setMemberName(newName);
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
    public List<Member> getAllMembers() {
        return memberRepository.findAll()
                .stream()
                .filter(member -> member.getMembershipType() == MembershipType.SimpleMember
                        || member.getMembershipType() == MembershipType.FullMember)
                .collect(Collectors.toList());
    }

    @Override
    public Member getMemberById(String memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));
    }

    // ★ 신규: 회원 탈퇴 로직 (즉시 비활성화 및 탈퇴 정보 기록)
    @Override
    public void withdrawMember(String memberId, String withdrawalReason) {
        // 1. 기존 회원 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        // 2. 계정 비활성화 및 탈퇴 정보 기록
        member.setActive(false);
        member.setWithdrawalDate(LocalDateTime.now());
        member.setWithdrawalReason(withdrawalReason);
        memberRepository.save(member);

        // ※ WithdrawnMember 저장 및 물리적 삭제는 스케줄러에서 1시간 후에 처리됩니다.
    }

    @Override
    public boolean reactivateMember(String memberId, String password) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        // 이미 활성화 상태이면 재활성화할 필요 없음
        if (member.getActive() != null && member.getActive()) {
            throw new IllegalArgumentException("계정이 이미 활성화 상태입니다.");
        }

        // 비밀번호 검증 (단순 문자열 비교, 실제 서비스에서는 암호화 비교 필요)
        if (!member.getMemberpassword().equals(password)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 재활성화 처리: active를 true로, 탈퇴 관련 필드 초기화
        member.setActive(true);
        member.setWithdrawalDate(null);
        member.setWithdrawalReason(null);
        memberRepository.save(member);

        // 만약 WithdrawnMember 테이블에 해당 회원의 기록이 있다면 삭제
        if (withdrawnMemberRepository.existsById(memberId)) {
            withdrawnMemberRepository.deleteById(memberId);
        }

        return true;
    }

}

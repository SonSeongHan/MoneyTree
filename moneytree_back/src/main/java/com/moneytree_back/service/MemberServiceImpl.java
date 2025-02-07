package com.moneytree_back.service;

import com.moneytree_back.domain.Member;
import com.moneytree_back.domain.MembershipType;
import com.moneytree_back.dto.MemberDTO;
import com.moneytree_back.dto.TransferHistoryDTO;
import com.moneytree_back.repository.MemberRepository;
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
        member.setMember_name(newName);
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

    // 모든 회원 조회 (간편회원, 정회원만 조회)
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

    // *** 추가: 단일 회원의 결제(송금) 기록만 조회 ***
//    @Override
//    public List<TransferHistoryDTO> getPaymentRecords(String memberId) {
//        // 회원 존재 여부 확인
//        Member member = getMemberById(memberId);
//        // 실제 로직에 따라 해당 회원의 결제 기록을 조회해야 합니다.
//        // 여기서는 예시로 더미 데이터를 반환합니다.
//        TransferHistoryDTO record1 = List<TransferHistoryDTO> transferHistoryDTOs = histories.stream()
//                .map(history -> TransferHistoryDTO.builder()
//                        .id(history.getId())
//                        .transactionType(history.getDandwacType().name())
//                        .amount(history.getAmount().doubleValue())
//                        .createdAt(history.getCreatedAt())
//                        .fromMemberName(history.getFromAccount().getMember().getMember_name())
//                        .toMemberName(history.getToAccount().getMember().getMember_name())
//                        .build())
//                .collect(Collectors.toList());
//        new TransferHistoryDTO(1L, "결제", 5000.0, LocalDateTime.now().minusDays(1));
//        TransferHistoryDTO record2 = new TransferHistoryDTO(2L, "환불", -2000.0, LocalDateTime.now().minusDays(3));
//        return List.of(record1, record2);
//    }
}

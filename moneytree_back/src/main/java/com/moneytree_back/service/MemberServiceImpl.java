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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;

    @Override
    public Member createMember(MemberDTO memberDTO) {
        Member member = new Member();

        // 기본 정보 세팅
        member.setName(memberDTO.getName());
        member.setResidentRegistrationNumber(memberDTO.getResidentRegistrationNumber());
        member.setPassword(memberDTO.getPassword());
        member.setPhoneNumber(memberDTO.getPhoneNumber());
        member.setJob(memberDTO.getJob());
        member.setCreditScore(memberDTO.getCreditScore());
        member.setCreatedAt(LocalDateTime.now());

        // membershipType 결정 로직
        String rrn = memberDTO.getResidentRegistrationNumber();
        String requestedMembershipType = memberDTO.getMembershipType();

        if (requestedMembershipType != null && !requestedMembershipType.isBlank()) {
            // membershipType을 직접 지정한 경우 (ADMIN, 매니저 등)
            member.setMembershipType(MembershipType.valueOf(requestedMembershipType));
        } else {
            // 주민등록번호 7자리 -> 간편회원, 13자리 -> 정회원
            if (rrn != null) {
                if (rrn.length() == 7) {
                    member.setMembershipType(MembershipType. SimpleMember);
                } else if (rrn.length() == 13) {
                    member.setMembershipType(MembershipType.FullMember);
                } else {
                    throw new IllegalArgumentException("주민등록번호 길이가 유효하지 않습니다.");
                }
            } else {
                // rrn이 null이면 기본적으로 간편회원
                member.setMembershipType(MembershipType.SimpleMember);
            }
        }

        // 나이 계산(주민등록번호가 13자리일 때만)
        if (rrn != null && rrn.length() == 13) {
            member.setAge(calculateAgeFromRRN(rrn));
        } else {
            member.setAge(null);
        }

        // 주소 유효성 체크 (정회원은 주소 필수)
        if (member.getMembershipType() == MembershipType.FullMember) {
            if (memberDTO.getAddress() == null || memberDTO.getAddress().isEmpty()) {
                throw new IllegalArgumentException("정회원은 주소가 필수입니다.");
            }
        }
        member.setAddress(memberDTO.getAddress());

        // 계좌번호 생성 (간편회원, 정회원만)
        if (member.getMembershipType() == MembershipType.SimpleMember
                || member.getMembershipType() == MembershipType.FullMember) {
            member.setAccountNumber(generateAccountNumber());
        } else {
            member.setAccountNumber(null);
        }

        // 저장
        return memberRepository.save(member);
    }

    /**
     * 주민등록번호(13자리)로 나이 계산
     *  - 예: YYMMDD + 성별코드
     */
    private Integer calculateAgeFromRRN(String rrn) {
        String yearStr = rrn.substring(0, 2);
        String monthStr = rrn.substring(2, 4);
        String dayStr = rrn.substring(4, 6);
        char genderCode = rrn.charAt(6);

        int year = Integer.parseInt(yearStr);
        int month = Integer.parseInt(monthStr);
        int day = Integer.parseInt(dayStr);

        // 1,2 -> 1900년대생 / 3,4 -> 2000년대생 (간단 로직)
        if (genderCode == '1' || genderCode == '2') {
            year += 1900;
        } else if (genderCode == '3' || genderCode == '4') {
            year += 2000;
        } else {
            // 기본값으로 1900년대생 처리
            year += 1900;
        }

        LocalDate birthDate = LocalDate.of(year, month, day);
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    /**
     * 계좌번호 생성 예시 (실제 서비스라면 은행코드/난수규칙 등 적용)
     */
    private String generateAccountNumber() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 14);
    }
}

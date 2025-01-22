package com.moneytree_back.repository;

import com.moneytree_back.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {

    // member_id 중복 체크
    boolean existsByMemberId(String memberId);

    // 주민등록번호 중복 체크
    boolean existsByResidentRegistrationNumber(String rrn);

    // 전화번호 중복 체크
    boolean existsByMemberPhoneNumber(String phoneNumber);

    // 로그인
    Optional<Member> findByResidentRegistrationNumberAndMemberpassword(String rrn, String password);
}

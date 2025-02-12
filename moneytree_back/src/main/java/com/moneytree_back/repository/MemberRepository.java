package com.moneytree_back.repository;

import com.moneytree_back.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, String> {

    // 중복 체크용 메서드 (예시)
    boolean existsByMemberId(String memberId);
    boolean existsByResidentRegistrationNumber(String rrn);
    boolean existsByMemberPhoneNumber(String phone);

    // 로그인(정회원) : 주민등록번호 + 비밀번호
    Optional<Member> findByResidentRegistrationNumberAndMemberpassword(String rrn, String pw);

    // 로그인(간편회원) : 아이디 + 비밀번호
    Optional<Member> findByMemberIdAndMemberpassword(String memberId, String pw);

    //MemberId로 Member 조회(사용처:커뮤니티)
    Optional<Member> findByMemberId(String memberId);
    List<Member> findByActiveFalseAndWithdrawalDateBefore(LocalDateTime time);

    @Query("SELECT m FROM Member m WHERE m.memberId = :memberId")
    Member getWithRoles(@Param("memberId") String memberId);

}

package com.moneytree_back.repository;

import com.moneytree_back.domain.member.WithdrawnMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WithdrawnMemberRepository extends JpaRepository<WithdrawnMember, String> {
    // 추가 쿼리 메서드가 필요하면 작성
}

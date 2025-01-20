package com.moneytree_back.repository;

import com.moneytree_back.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Member 엔티티에 대한 DB 접근 (CRUD) 인터페이스
 */
@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
}

package com.moneytree_back.repository;


import com.moneytree_back.domain.Dandwac;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DandwacRepository extends JpaRepository<Dandwac, String> {
    // member가 가진 dandw_ac_id를 찾는 쿼리 메서드
    Optional<Dandwac> findByMember_MemberId(String memberId);
}

package com.moneytree_back.repository;


import com.moneytree_back.domain.Dandwac;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 입출금 계좌 JPA Repository
 */
public interface DandwacRepository extends JpaRepository<Dandwac, String> {
    // 기본적인 CRUD 메서드는 JpaRepository가 제공
}
package com.moneytree_back.repository;

import com.moneytree_back.domain.EstateCommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstateCommunityPostRepository extends JpaRepository<EstateCommunityPost, Long> {
  // 기본적으로 findAll(Pageable pageable)를 제공하므로 별도 추가 구현은 필요하지 않습니다.
}

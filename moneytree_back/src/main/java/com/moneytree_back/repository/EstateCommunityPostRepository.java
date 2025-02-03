package com.moneytree_back.repository;

import com.moneytree_back.domain.EstateCommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstateCommunityPostRepository extends JpaRepository<EstateCommunityPost, Long> {
  // 추가적인 쿼리 메서드가 필요하면 정의
}

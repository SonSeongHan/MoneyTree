package com.moneytree_back.repository;

import com.moneytree_back.domain.CommunityReplies;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;



public interface CommunityRepliesRepository extends JpaRepository<CommunityReplies, Long> {

 Page<CommunityReplies> findByCommunityPostId(Long postId, Pageable pageable);
}

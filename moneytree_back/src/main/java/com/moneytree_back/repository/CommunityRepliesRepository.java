package com.moneytree_back.repository;

import com.moneytree_back.domain.CommunityReplies;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityRepliesRepository extends JpaRepository<CommunityReplies, Long> {

 // 게시글 ID로 댓글을 조회
 Page<CommunityReplies> findByCommunityPostId(Long postId, Pageable pageable);

 // 게시글 ID로 댓글 개수를 조회
 long countByCommunityPostId(Long postId);  // 댓글 개수 반환
}

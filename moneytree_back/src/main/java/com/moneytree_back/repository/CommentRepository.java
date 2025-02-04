package com.moneytree_back.repository;

import com.moneytree_back.domain.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
  // post_id로 댓글을 페이지네이션하여 조회
  Page<Comment> findByPostId(Long postId, Pageable pageable);
}

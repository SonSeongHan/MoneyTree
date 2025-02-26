package com.moneytree_back.repository;

import com.moneytree_back.domain.Community;
import com.moneytree_back.domain.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CommunityRepository extends JpaRepository<Community, Long> {

    // PostType을 기준으로 게시글을 조회
    Page<Community> findAllByPostType(PostType postType, Pageable pageable);

    // PostType과 Category를 기준으로 게시글을 조회
    Page<Community> findAllByPostTypeAndCategory(PostType postType, String category, Pageable pageable);

    // 댓글 수 기준으로 많은 순으로 정렬
    @Query("SELECT c FROM Community c LEFT JOIN c.replies r GROUP BY c ORDER BY COUNT(r) DESC")
    Page<Community> findAllByPostTypeOrderByCommentCountDesc(PostType postType, Pageable pageable);

    // 댓글 수 기준으로 적은 순으로 정렬
    @Query("SELECT c FROM Community c LEFT JOIN c.replies r GROUP BY c ORDER BY COUNT(r) ASC")
    Page<Community> findAllByPostTypeOrderByCommentCountAsc(PostType postType, Pageable pageable);
}


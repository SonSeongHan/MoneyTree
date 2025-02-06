package com.moneytree_back.repository;

import com.moneytree_back.domain.EstateCommunityPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EstateCommunityPostRepository extends JpaRepository<EstateCommunityPost, Long> {

  // 기존 Pageable 기반 메소드들
  Page<EstateCommunityPost> findByCategory(String category, Pageable pageable);

  Page<EstateCommunityPost> findByTitleContaining(String title, Pageable pageable);

  Page<EstateCommunityPost> findByContentContaining(String content, Pageable pageable);

  Page<EstateCommunityPost> findByTitleContainingOrContentContaining(String title, String content, Pageable pageable);

  Page<EstateCommunityPost> findByMember_MemberIdContaining(String memberId, Pageable pageable);

  // 추가: 정렬(Sort)을 지원하는 메소드들, in‑memory 필터링용 전체 리스트를 가져오기 위해 사용
  List<EstateCommunityPost> findAll(Sort sort);

  List<EstateCommunityPost> findByCategory(String category, Sort sort);

  List<EstateCommunityPost> findByTitleContaining(String title, Sort sort);

  List<EstateCommunityPost> findByContentContaining(String content, Sort sort);

  List<EstateCommunityPost> findByTitleContainingOrContentContaining(String title, String content, Sort sort);

  List<EstateCommunityPost> findByMember_MemberIdContaining(String memberId, Sort sort);
}

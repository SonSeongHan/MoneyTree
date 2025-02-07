package com.moneytree_back.service;

import com.moneytree_back.dto.EstateCommunityPostDTO;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface EstateCommunityService {

  /**
   * 게시글 전체 목록 조회 (페이지네이션 적용)
   * @param page 현재 페이지 번호
   * @param size 한 페이지당 게시글 수
   * @param category 카테고리 필터 ("전체보기"이면 전체 조회)
   * @param searchField 검색 조건 ("title", "content", "titleContent", "author")
   * @param search 검색어
   * @param commentFilter 댓글 필터 (빈 문자열이면 적용 안함, "none"이면 댓글이 없는 글, "many"이면 댓글 많은 순으로 정렬)
   * @return 필터링 및 정렬된 게시글 목록
   */
  Page<EstateCommunityPostDTO> getAllPosts(int page, int size, String category, String searchField, String search, String commentFilter);

  // 게시글 상세 조회
  EstateCommunityPostDTO getPost(Long id);

  // 게시글 작성 (파일 업로드 포함)
  EstateCommunityPostDTO createPost(String title, String content, MultipartFile image, String memberId, String category);

  // 게시글 수정 (JSON 기반, 파일 미처리)
  EstateCommunityPostDTO updatePost(Long id, EstateCommunityPostDTO postDTO);

  // 게시글 수정 (파일 업데이트 포함)
  EstateCommunityPostDTO updatePostWithFile(Long id, String title, String content, MultipartFile image);

  // 게시글 삭제
  void deletePost(Long id);
}

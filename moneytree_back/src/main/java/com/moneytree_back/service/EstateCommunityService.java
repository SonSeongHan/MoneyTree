package com.moneytree_back.service;

import com.moneytree_back.dto.EstateCommunityPostDTO;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface EstateCommunityService {

  // 게시글 전체 목록 조회 (페이지네이션 적용)
  Page<EstateCommunityPostDTO> getAllPosts(int page, int size);

  // 게시글 상세 조회
  EstateCommunityPostDTO getPost(Long id);

  // 게시글 작성 (파일 업로드 포함, 단일 파일 지원)
  EstateCommunityPostDTO createPost(String title, String content, MultipartFile image);

  // 게시글 수정 (JSON 기반, 파일 미처리)
  EstateCommunityPostDTO updatePost(Long id, EstateCommunityPostDTO postDTO);

  // 게시글 수정 (파일 업데이트 포함, 단일 파일 지원)
  EstateCommunityPostDTO updatePostWithFile(Long id, String title, String content, MultipartFile image);

  // 게시글 삭제
  void deletePost(Long id);
}

package com.moneytree_back.controller;

import com.moneytree_back.dto.EstateCommunityPostDTO;
import com.moneytree_back.service.EstateCommunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/estate-community")
public class EstateCommunityController {

  private final EstateCommunityService communityService;

  @Autowired
  public EstateCommunityController(EstateCommunityService communityService) {
    this.communityService = communityService;
  }

  /**
   * 게시글 전체 목록 조회 (카테고리, 검색, 댓글 필터 포함)
   */
  @GetMapping
  public ResponseEntity<Page<EstateCommunityPostDTO>> getAllPosts(
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "10") int size,
          @RequestParam(defaultValue = "전체보기") String category,
          @RequestParam(defaultValue = "") String searchField,
          @RequestParam(defaultValue = "") String search,
          @RequestParam(defaultValue = "") String commentFilter) {
    Page<EstateCommunityPostDTO> postPage = communityService.getAllPosts(page, size, category, searchField, search, commentFilter);
    return ResponseEntity.ok(postPage);
  }

  /**
   * 특정 게시글 상세 조회
   */
  @GetMapping("/{id}")
  public ResponseEntity<EstateCommunityPostDTO> getPost(@PathVariable Long id) {
    EstateCommunityPostDTO dto = communityService.getPost(id);
    return ResponseEntity.ok(dto);
  }

  /**
   * 게시글 작성
   */
  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<EstateCommunityPostDTO> createPost(
          @RequestParam("title") String title,
          @RequestParam("content") String content,
          @RequestParam(value = "image", required = false) MultipartFile image,
          @RequestParam("memberId") String memberId,
          @RequestParam("category") String category
  ) {
    EstateCommunityPostDTO savedDTO = communityService.createPost(title, content, image, memberId, category);
    return ResponseEntity.status(HttpStatus.CREATED).body(savedDTO);
  }

  /**
   * 게시글 수정 (JSON 기반)
   */
  @PutMapping("/{id}")
  public ResponseEntity<EstateCommunityPostDTO> updatePost(
          @PathVariable Long id,
          @RequestBody EstateCommunityPostDTO postDTO
  ) {
    EstateCommunityPostDTO updatedDTO = communityService.updatePost(id, postDTO);
    return ResponseEntity.ok(updatedDTO);
  }

  /**
   * 게시글 수정 (파일 업데이트 포함)
   */
  @PutMapping(path = "/{id}/with-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<EstateCommunityPostDTO> updatePostWithFile(
          @PathVariable Long id,
          @RequestParam("title") String title,
          @RequestParam("content") String content,
          @RequestParam(value = "image", required = false) MultipartFile image
  ) {
    EstateCommunityPostDTO updatedDTO = communityService.updatePostWithFile(id, title, content, image);
    return ResponseEntity.ok(updatedDTO);
  }

  /**
   * 게시글 삭제
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletePost(@PathVariable Long id) {
    communityService.deletePost(id);
    return ResponseEntity.noContent().build();
  }
}

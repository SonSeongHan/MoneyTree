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

import java.util.List;

/**
 * 게시글 관련 REST API 엔드포인트를 제공하는 컨트롤러입니다.
 * 이 컨트롤러는 게시글의 목록, 상세 조회, 작성, 수정(파일 포함), 삭제 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/estate-community")
public class EstateCommunityController {

  // 서비스 계층을 통해 비즈니스 로직을 수행합니다.
  private final EstateCommunityService communityService;

  @Autowired
  public EstateCommunityController(EstateCommunityService communityService) {
    this.communityService = communityService;
  }

  /**
   * 게시글 전체 목록을 페이지네이션해서 조회하는 엔드포인트입니다.
   * 쿼리 파라미터로 page(현재 페이지, 기본값 0)와 size(한 페이지당 항목 수, 기본값 10)를 받습니다.
   * 현재는 Page 객체의 content(게시글 목록 배열)만 반환하고 있습니다.
   *
   * @param page 현재 페이지 번호 (0부터 시작)
   * @param size 한 페이지당 게시글 수
   * @return 게시글 목록 배열을 포함하는 ResponseEntity
   */
  @GetMapping
  public ResponseEntity<Page<EstateCommunityPostDTO>> getAllPosts(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) {
    Page<EstateCommunityPostDTO> postPage = communityService.getAllPosts(page, size);
    return ResponseEntity.ok(postPage);
  }
  /**
   * 특정 게시글의 상세 정보를 조회하는 엔드포인트입니다.
   *
   * @param id 게시글의 고유 ID
   * @return 해당 게시글의 상세 정보를 담은 DTO를 반환하는 ResponseEntity
   */
  @GetMapping("/{id}")
  public ResponseEntity<EstateCommunityPostDTO> getPost(@PathVariable Long id) {
    EstateCommunityPostDTO dto = communityService.getPost(id);
    return ResponseEntity.ok(dto);
  }

  /**
   * 게시글을 작성하는 엔드포인트입니다.
   * 파일 업로드를 지원하며, Multipart/form-data 형식으로 요청합니다.
   *
   * @param title   게시글 제목
   * @param content 게시글 내용
   * @param image   (선택 사항) 업로드할 이미지 파일
   * @return 생성된 게시글의 DTO를 포함하는 ResponseEntity (HTTP 201 Created)
   */
  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<EstateCommunityPostDTO> createPost(
    @RequestParam("title") String title,
    @RequestParam("content") String content,
    @RequestParam(value = "image", required = false) MultipartFile image) {
    EstateCommunityPostDTO savedDTO = communityService.createPost(title, content, image);
    return ResponseEntity.status(HttpStatus.CREATED).body(savedDTO);
  }

  /**
   * 게시글을 수정하는 엔드포인트입니다.
   * JSON 데이터를 받아 게시글을 수정합니다(파일 미처리).
   *
   * @param id      수정할 게시글의 ID
   * @param postDTO 수정할 게시글 데이터를 담은 DTO (제목, 내용, 작성자 등)
   * @return 수정된 게시글의 DTO를 반환하는 ResponseEntity
   */
  @PutMapping("/{id}")
  public ResponseEntity<EstateCommunityPostDTO> updatePost(
    @PathVariable Long id,
    @RequestBody EstateCommunityPostDTO postDTO) {
    EstateCommunityPostDTO updatedDTO = communityService.updatePost(id, postDTO);
    return ResponseEntity.ok(updatedDTO);
  }

  /**
   * 게시글을 수정하는 엔드포인트입니다.
   * 파일 업데이트를 포함하여 수정하며, Multipart/form-data 형식으로 요청합니다.
   *
   * @param id      수정할 게시글의 ID
   * @param title   수정할 게시글 제목
   * @param content 수정할 게시글 내용
   * @param image   (선택 사항) 수정할 이미지 파일
   * @return 수정된 게시글의 DTO를 반환하는 ResponseEntity
   */
  @PutMapping(path = "/{id}/with-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<EstateCommunityPostDTO> updatePostWithFile(
    @PathVariable Long id,
    @RequestParam("title") String title,
    @RequestParam("content") String content,
    @RequestParam(value = "image", required = false) MultipartFile image) {
    EstateCommunityPostDTO updatedDTO = communityService.updatePostWithFile(id, title, content, image);
    return ResponseEntity.ok(updatedDTO);
  }

  /**
   * 게시글을 삭제하는 엔드포인트입니다.
   *
   * @param id 삭제할 게시글의 ID
   * @return 삭제 성공 시 HTTP 204 No Content 응답을 반환합니다.
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletePost(@PathVariable Long id) {
    communityService.deletePost(id);
    return ResponseEntity.noContent().build();
  }
}
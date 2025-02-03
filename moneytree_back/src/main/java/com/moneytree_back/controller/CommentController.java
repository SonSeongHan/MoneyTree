package com.moneytree_back.controller;

import com.moneytree_back.dto.CommentDTO;
import com.moneytree_back.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 이 컨트롤러는 댓글 관련 REST API 엔드포인트를 제공합니다.
 * 기능:
 *  - 특정 게시글에 댓글 작성 (POST)
 *  - 댓글 수정 (PUT)
 *  - 댓글 삭제 (DELETE)
 *  - 특정 게시글의 댓글을 페이지네이션해서 조회 (GET)
 */
@RestController
@RequestMapping("/api/comments")
public class CommentController {

  private final CommentService commentService;

  @Autowired
  public CommentController(CommentService commentService) {
    this.commentService = commentService;
  }

  /**
   * 특정 게시글에 댓글을 작성합니다.
   * URL: POST /api/comments?postId={postId}
   *
   * @param postId     댓글을 작성할 게시글의 ID (쿼리 파라미터)
   * @param commentDTO 댓글의 내용 및 작성자 정보를 담은 DTO (JSON 형식)
   * @return 생성된 댓글 DTO와 HTTP 201 Created 상태를 반환합니다.
   */
  @PostMapping
  public ResponseEntity<CommentDTO> addComment(
    @RequestParam("postId") Long postId,
    @RequestBody CommentDTO commentDTO) {
    CommentDTO createdComment = commentService.addComment(postId, commentDTO);
    return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
  }

  /**
   * 특정 댓글을 수정합니다.
   * URL: PUT /api/comments/{id}
   *
   * @param id         수정할 댓글의 ID (경로 변수)
   * @param commentDTO 수정할 댓글 데이터를 담은 DTO (JSON 형식)
   * @return 수정된 댓글 DTO와 HTTP 200 OK 상태를 반환합니다.
   */
  @PutMapping("/{id}")
  public ResponseEntity<CommentDTO> updateComment(
    @PathVariable Long id,
    @RequestBody CommentDTO commentDTO) {
    CommentDTO updatedComment = commentService.updateComment(id, commentDTO);
    return ResponseEntity.ok(updatedComment);
  }

  /**
   * 특정 댓글을 삭제합니다.
   * URL: DELETE /api/comments/{id}
   *
   * @param id 삭제할 댓글의 ID (경로 변수)
   * @return 삭제 성공 시 HTTP 204 No Content 상태를 반환합니다.
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
    commentService.deleteComment(id);
    return ResponseEntity.noContent().build();
  }

  /**
   * 특정 게시글의 댓글을 페이지네이션하여 조회합니다.
   * URL: GET /api/comments?postId={postId}&page={page}&size={size}
   *
   * @param postId 댓글을 조회할 게시글의 ID (쿼리 파라미터)
   * @param page   현재 페이지 (기본값 0)
   * @param size   한 페이지당 댓글 수 (기본값 10)
   * @return 댓글 DTO가 담긴 Page 객체와 HTTP 200 OK 상태를 반환합니다.
   */
  @GetMapping
  public ResponseEntity<Page<CommentDTO>> getCommentsByPost(
    @RequestParam("postId") Long postId,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) {
    Page<CommentDTO> commentPage = commentService.getCommentsByPostId(postId, page, size);
    return ResponseEntity.ok(commentPage);
  }
}

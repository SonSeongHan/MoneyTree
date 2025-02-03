package com.moneytree_back.controller;

import com.moneytree_back.dto.CommentDTO;
import com.moneytree_back.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

  private final CommentService commentService;

  @Autowired
  public CommentController(CommentService commentService) {
    this.commentService = commentService;
  }

  // 댓글 작성 (특정 게시글에 대한 댓글)
  @PostMapping
  public ResponseEntity<CommentDTO> addComment(
    @RequestParam("postId") Long postId,
    @RequestBody CommentDTO commentDTO) {
    CommentDTO createdComment = commentService.addComment(postId, commentDTO);
    return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
  }

  // 댓글 수정
  @PutMapping("/{id}")
  public ResponseEntity<CommentDTO> updateComment(
    @PathVariable Long id,
    @RequestBody CommentDTO commentDTO) {
    CommentDTO updatedComment = commentService.updateComment(id, commentDTO);
    return ResponseEntity.ok(updatedComment);
  }

  // 댓글 삭제
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
    commentService.deleteComment(id);
    return ResponseEntity.noContent().build();
  }
}

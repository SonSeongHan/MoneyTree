package com.moneytree_back.service;

import com.moneytree_back.dto.CommentDTO;
import org.springframework.data.domain.Page;

/**
 * CommentService 인터페이스는 댓글 관련 비즈니스 로직을 정의합니다.
 * 기능:
 *  - 특정 게시글(postId)에 댓글 추가
 *  - 댓글 수정
 *  - 댓글 삭제
 *  - 특정 게시글의 댓글을 페이지네이션하여 조회 (한 페이지에 10개씩)
 */
public interface CommentService {

  /**
   * 특정 게시글(postId)에 댓글을 추가합니다.
   *
   * @param postId     댓글이 달릴 게시글의 ID
   * @param commentDTO 댓글 정보를 담은 DTO
   * @return 저장된 댓글의 DTO
   */
  CommentDTO addComment(Long postId, CommentDTO commentDTO);

  /**
   * 특정 댓글(commentId)을 수정합니다.
   *
   * @param commentId 수정할 댓글의 ID
   * @param commentDTO 수정할 댓글 정보를 담은 DTO
   * @return 수정된 댓글의 DTO
   */
  CommentDTO updateComment(Long commentId, CommentDTO commentDTO);

  /**
   * 특정 댓글(commentId)을 삭제합니다.
   *
   * @param commentId 삭제할 댓글의 ID
   */
  void deleteComment(Long commentId);

  /**
   * 특정 게시글(postId)의 댓글을 페이지네이션하여 조회합니다.
   *
   * @param postId 댓글을 조회할 게시글의 ID
   * @param page   현재 페이지 (0부터 시작)
   * @param size   한 페이지당 댓글 수
   * @return 댓글 DTO Page 객체
   */
  Page<CommentDTO> getCommentsByPostId(Long postId, int page, int size);
}

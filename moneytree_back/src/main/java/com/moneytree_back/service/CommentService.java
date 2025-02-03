package com.moneytree_back.service;

import com.moneytree_back.dto.CommentDTO;
import org.springframework.data.domain.Page;

public interface CommentService {

  // 댓글 작성: 특정 게시글(postId)에 댓글 추가
  CommentDTO addComment(Long postId, CommentDTO commentDTO);

  // 댓글 수정: 댓글 ID와 수정할 내용 전달
  CommentDTO updateComment(Long commentId, CommentDTO commentDTO);

  // 댓글 삭제: 댓글 ID로 삭제
  void deleteComment(Long commentId);

  // 특정 게시글(postId)의 댓글을 페이지네이션하여 조회 (한 페이지에 10개)
  Page<CommentDTO> getCommentsByPostId(Long postId, int page, int size);
}

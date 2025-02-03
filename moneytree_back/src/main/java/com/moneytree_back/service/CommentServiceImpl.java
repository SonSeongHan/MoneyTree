package com.moneytree_back.service;

import com.moneytree_back.domain.Comment;
import com.moneytree_back.domain.EstateCommunityPost;
import com.moneytree_back.dto.CommentDTO;
import com.moneytree_back.repository.CommentRepository;
import com.moneytree_back.repository.EstateCommunityPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl implements CommentService {

  private final CommentRepository commentRepository;
  private final EstateCommunityPostRepository postRepository;

  @Autowired
  public CommentServiceImpl(CommentRepository commentRepository,
                            EstateCommunityPostRepository postRepository) {
    this.commentRepository = commentRepository;
    this.postRepository = postRepository;
  }

  @Override
  public CommentDTO addComment(Long postId, CommentDTO commentDTO) {
    EstateCommunityPost post = postRepository.findById(postId)
      .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. id: " + postId));

    Comment comment = new Comment();
    comment.setText(commentDTO.getText());
    comment.setAuthor(commentDTO.getAuthor());
    comment.setCreatedAt(LocalDateTime.now());
    comment.setUpdatedAt(LocalDateTime.now());
    comment.setPost(post);

    Comment savedComment = commentRepository.save(comment);
    return convertToDTO(savedComment);
  }

  @Override
  public CommentDTO updateComment(Long commentId, CommentDTO commentDTO) {
    Comment comment = commentRepository.findById(commentId)
      .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다. id: " + commentId));
    comment.setText(commentDTO.getText());
    comment.setAuthor(commentDTO.getAuthor());
    // 수정 시 updatedAt 업데이트
    comment.setUpdatedAt(LocalDateTime.now());
    Comment updatedComment = commentRepository.save(comment);
    return convertToDTO(updatedComment);
  }

  @Override
  public void deleteComment(Long commentId) {
    Comment comment = commentRepository.findById(commentId)
      .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다. id: " + commentId));
    commentRepository.delete(comment);
  }

  @Override
  @Transactional
  public Page<CommentDTO> getCommentsByPostId(Long postId, int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    Page<Comment> commentPage = commentRepository.findByPostId(postId, pageable);
    List<CommentDTO> commentDTOs = commentPage.stream()
      .map(this::convertToDTO)
      .collect(Collectors.toList());
    return new PageImpl<>(commentDTOs, pageable, commentPage.getTotalElements());
  }

  // 엔티티 Comment를 DTO로 변환하는 헬퍼 메서드
  private CommentDTO convertToDTO(Comment comment) {
    CommentDTO dto = new CommentDTO();
    dto.setId(comment.getId());
    dto.setText(comment.getText());
    dto.setAuthor(comment.getAuthor());
    dto.setCreatedAt(comment.getCreatedAt());
    dto.setUpdatedAt(comment.getUpdatedAt());
    return dto;
  }
}

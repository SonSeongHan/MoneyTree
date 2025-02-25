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

/**
 * CommentServiceImpl 클래스는 CommentService 인터페이스를 구현하여,
 * 댓글 추가, 수정, 삭제, 그리고 특정 게시글의 댓글을 페이지네이션하여 조회하는 기능을 제공합니다.
 */
@Service
public class CommentServiceImpl implements CommentService {

  // 댓글 데이터를 처리하기 위한 Repository
  private final CommentRepository commentRepository;
  // 게시글 데이터를 조회하기 위한 Repository (댓글 추가 시 게시글 정보 참조)
  private final EstateCommunityPostRepository postRepository;

  @Autowired
  public CommentServiceImpl(CommentRepository commentRepository,
                            EstateCommunityPostRepository postRepository) {
    this.commentRepository = commentRepository;
    this.postRepository = postRepository;
  }

  /**
   * 특정 게시글에 댓글을 추가합니다.
   */
  @Override
  public CommentDTO addComment(Long postId, CommentDTO commentDTO) {
    // 게시글 ID를 통해 해당 게시글을 조회합니다.
    EstateCommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. id: " + postId));

    // 댓글 엔티티 생성 후, 입력받은 정보를 설정합니다.
    Comment comment = new Comment();
    comment.setText(commentDTO.getText());
    comment.setAuthor(commentDTO.getAuthor());
    comment.setCreatedAt(LocalDateTime.now());
    comment.setUpdatedAt(LocalDateTime.now());
    comment.setPost(post);

    // 댓글을 저장하고 DTO로 변환하여 반환합니다.
    Comment savedComment = commentRepository.save(comment);
    return convertToDTO(savedComment);
  }

  /**
   * 특정 댓글을 수정합니다.
   */
  @Override
  public CommentDTO updateComment(Long commentId, CommentDTO commentDTO) {
    // 댓글 ID로 댓글 엔티티 조회
    Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다. id: " + commentId));
    // 댓글 정보를 업데이트합니다.
    comment.setText(commentDTO.getText());
    comment.setAuthor(commentDTO.getAuthor());
    // 수정 시 updatedAt을 업데이트합니다.
    comment.setUpdatedAt(LocalDateTime.now());
    Comment updatedComment = commentRepository.save(comment);
    return convertToDTO(updatedComment);
  }

  /**
   * 특정 댓글을 삭제합니다.
   */
  @Override
  public void deleteComment(Long commentId) {
    Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다. id: " + commentId));
    commentRepository.delete(comment);
  }

  /**
   * 특정 게시글의 댓글을 페이지네이션하여 조회합니다.
   * @param postId 댓글을 조회할 게시글의 ID
   * @param page   현재 페이지 (0부터 시작)
   * @param size   한 페이지당 댓글 수
   * @return 댓글 DTO의 Page 객체
   */
  @Override
  @Transactional
  public Page<CommentDTO> getCommentsByPostId(Long postId, int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    // 댓글을 게시글 ID와 Pageable을 사용하여 조회합니다.
    Page<Comment> commentPage = commentRepository.findByPostId(postId, pageable);
    // 댓글 엔티티들을 DTO로 변환합니다.
    List<CommentDTO> commentDTOs = commentPage.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    return new PageImpl<>(commentDTOs, pageable, commentPage.getTotalElements());
  }

  /**
   * Comment 엔티티를 CommentDTO로 변환하는 헬퍼 메서드입니다.
   *
   * @param comment 댓글 엔티티
   * @return 변환된 CommentDTO
   */
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

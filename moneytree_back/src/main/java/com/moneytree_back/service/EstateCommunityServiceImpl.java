package com.moneytree_back.service;

import com.moneytree_back.domain.Comment;
import com.moneytree_back.domain.EstateCommunityPost;
import com.moneytree_back.dto.CommentDTO;
import com.moneytree_back.dto.EstateCommunityPostDTO;
import com.moneytree_back.repository.CommentRepository;
import com.moneytree_back.repository.EstateCommunityPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * EstateCommunityServiceImpl 클래스는 게시글 관련 비즈니스 로직을 구현합니다.
 * 주요 기능:
 *  - 게시글 목록 조회 (페이지네이션 적용)
 *  - 게시글 상세 조회
 *  - 게시글 작성 (단일 파일 업로드 지원)
 *  - 게시글 수정 (파일 미포함/포함)
 *  - 게시글 삭제
 *  - 댓글 추가 (추가 기능)
 */
@Service
public class EstateCommunityServiceImpl implements EstateCommunityService {

  // 게시글 및 댓글 데이터를 처리하기 위한 Repository 주입
  private final EstateCommunityPostRepository postRepository;
  private final CommentRepository commentRepository;

  // application.properties에 정의된 업로드 경로(예: uploads)를 주입받음
  @Value("${moneytree_back.upload.path}")
  private String uploadPath;

  @Autowired
  public EstateCommunityServiceImpl(EstateCommunityPostRepository postRepository,
                                    CommentRepository commentRepository) {
    this.postRepository = postRepository;
    this.commentRepository = commentRepository;
  }

  /**
   * 게시글 엔티티를 EstateCommunityPostDTO로 변환하는 헬퍼 메서드입니다.
   * 댓글 목록과 파일 업로드 정보를 포함합니다.
   *
   * @param post 게시글 엔티티
   * @return 변환된 EstateCommunityPostDTO
   */
  private EstateCommunityPostDTO convertToDTO(EstateCommunityPost post) {
    EstateCommunityPostDTO dto = new EstateCommunityPostDTO();
    dto.setId(post.getId());
    dto.setTitle(post.getTitle());
    dto.setContent(post.getContent());
    dto.setAuthor(post.getAuthor());
    dto.setCreatedAt(post.getCreatedAt());
    dto.setUpdatedAt(post.getUpdatedAt());
    dto.setImageUrl(post.getImageUrl());
    dto.setImageFileName(post.getImageFileName());
    if (post.getComments() != null) {
      List<CommentDTO> commentDTOs = post.getComments().stream()
        .sorted((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()))
        .map(comment -> {
          CommentDTO cDto = new CommentDTO();
          cDto.setId(comment.getId());
          cDto.setText(comment.getText());
          cDto.setAuthor(comment.getAuthor());
          cDto.setCreatedAt(comment.getCreatedAt());
          cDto.setUpdatedAt(comment.getUpdatedAt());
          return cDto;
        })
        .collect(Collectors.toList());
      dto.setComments(commentDTOs);
    }
    return dto;
  }

  /**
   * 게시글 전체 목록을 페이지네이션하여 조회합니다.
   * Pageable을 생성하고, Repository의 findAll(pageable) 메서드를 호출합니다.
   *
   * @param page 현재 페이지 번호 (0부터 시작)
   * @param size 한 페이지당 게시글 수
   * @return 게시글 DTO의 Page 객체
   */
  @Override
  @Transactional
  public Page<EstateCommunityPostDTO> getAllPosts(int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    Page<EstateCommunityPost> postPage = postRepository.findAll(pageable);
    // Lazy 로딩된 댓글 데이터를 초기화하여 DTO 변환 시 문제를 방지합니다.
    postPage.forEach(post -> post.getComments().size());
    List<EstateCommunityPostDTO> dtoList = postPage.stream()
      .map(this::convertToDTO)
      .collect(Collectors.toList());
    return new PageImpl<>(dtoList, pageable, postPage.getTotalElements());
  }

  /**
   * 특정 게시글의 상세 정보를 조회합니다.
   *
   * @param id 게시글의 ID
   * @return 해당 게시글의 DTO
   */
  @Override
  @Transactional
  public EstateCommunityPostDTO getPost(Long id) {
    EstateCommunityPost post = postRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. id: " + id));
    post.getComments().size(); // 댓글 데이터 Lazy 초기화
    return convertToDTO(post);
  }

  /**
   * 게시글을 작성합니다.
   * 파일 업로드가 포함되어 있으면, 지정된 업로드 경로에 파일을 저장한 후, 파일 URL과 원본 파일명을 엔티티에 저장합니다.
   *
   * @param title   게시글 제목
   * @param content 게시글 내용
   * @param image   (선택 사항) 업로드할 이미지 파일
   * @return 생성된 게시글 DTO
   */
  @Override
  public EstateCommunityPostDTO createPost(String title, String content, MultipartFile image) {
    EstateCommunityPost post = new EstateCommunityPost();
    post.setTitle(title);
    post.setContent(content);
    // 파일 업로드 처리
    if (image != null && !image.isEmpty()) {
      String absoluteUploadPath = System.getProperty("user.dir")
        + File.separator + uploadPath + File.separator;
      File uploadDirFile = new File(absoluteUploadPath);
      if (!uploadDirFile.exists()) {
        boolean created = uploadDirFile.mkdirs();
        System.out.println("업로드 폴더 생성 여부: " + created + ", 경로: " + uploadDirFile.getAbsolutePath());
      }
      try {
        // 파일명을 유니크하게 만들기 위해 현재 시간을 접두사로 추가합니다.
        String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        File dest = new File(absoluteUploadPath + fileName);
        System.out.println("파일 저장 경로: " + dest.getAbsolutePath());
        image.transferTo(dest);
        System.out.println("파일 저장 성공: " + fileName);
        String imageUrl = "http://localhost:8080/" + uploadPath + "/" + fileName;
        post.setImageUrl(imageUrl);
        post.setImageFileName(image.getOriginalFilename());
      } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException("파일 업로드에 실패했습니다.", e);
      }
    }
    post.setCreatedAt(LocalDateTime.now());
    post.setUpdatedAt(LocalDateTime.now());
    EstateCommunityPost savedPost = postRepository.save(post);
    return convertToDTO(savedPost);
  }

  /**
   * 게시글을 수정합니다 (JSON 기반, 파일 미포함).
   * 이 메서드는 게시글 제목, 내용, 작성자 정보를 업데이트하며, 파일 정보는 유지합니다.
   *
   * @param id      수정할 게시글의 ID
   * @param postDTO 수정할 데이터가 담긴 DTO
   * @return 수정된 게시글 DTO
   */
  @Override
  public EstateCommunityPostDTO updatePost(Long id, EstateCommunityPostDTO postDTO) {
    EstateCommunityPost existingPost = postRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. id: " + id));
    existingPost.setTitle(postDTO.getTitle());
    existingPost.setContent(postDTO.getContent());
    existingPost.setAuthor(postDTO.getAuthor());
    existingPost.setUpdatedAt(LocalDateTime.now());
    // 기존 파일 정보는 변경하지 않습니다.
    EstateCommunityPost updatedPost = postRepository.save(existingPost);
    return convertToDTO(updatedPost);
  }

  /**
   * 게시글을 수정합니다 (파일 업데이트 포함).
   * 새 이미지 파일이 제공되면, 기존 파일 정보를 덮어씁니다.
   *
   * @param id      수정할 게시글의 ID
   * @param title   수정할 제목
   * @param content 수정할 내용
   * @param image   (선택 사항) 업로드할 새 이미지 파일
   * @return 수정된 게시글 DTO
   */
  @Override
  public EstateCommunityPostDTO updatePostWithFile(Long id, String title, String content, MultipartFile image) {
    EstateCommunityPost existingPost = postRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. id: " + id));
    existingPost.setTitle(title);
    existingPost.setContent(content);
    // 새 파일이 제공되면 파일 업로드 처리 후 파일 정보를 덮어씁니다.
    if (image != null && !image.isEmpty()) {
      String absoluteUploadPath = System.getProperty("user.dir")
        + File.separator + uploadPath + File.separator;
      File uploadDirFile = new File(absoluteUploadPath);
      if (!uploadDirFile.exists()) {
        uploadDirFile.mkdirs();
      }
      try {
        String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        File dest = new File(absoluteUploadPath + fileName);
        image.transferTo(dest);
        String imageUrl = "http://localhost:8080/" + uploadPath + "/" + fileName;
        existingPost.setImageUrl(imageUrl);
        existingPost.setImageFileName(image.getOriginalFilename());
      } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException("파일 업로드에 실패했습니다.", e);
      }
    }
    existingPost.setUpdatedAt(LocalDateTime.now());
    EstateCommunityPost updatedPost = postRepository.save(existingPost);
    return convertToDTO(updatedPost);
  }

  /**
   * 게시글을 삭제합니다.
   *
   * @param id 삭제할 게시글의 ID
   */
  @Override
  public void deletePost(Long id) {
    EstateCommunityPost post = postRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. id: " + id));
    postRepository.delete(post);
  }

  /**
   * 댓글 추가를 처리하는 메서드입니다.
   * 특정 게시글(postId)을 찾아 댓글 엔티티를 생성하고 저장한 후, DTO로 변환하여 반환합니다.
   *
   * @param postId     댓글이 달릴 게시글의 ID
   * @param commentDTO 댓글 내용 및 작성자 정보를 담은 DTO
   * @return 저장된 댓글의 DTO
   */
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
    return convertToCommentDTO(savedComment);
  }

  /**
   * Comment 엔티티를 CommentDTO로 변환하는 헬퍼 메서드입니다.
   *
   * @param comment 댓글 엔티티
   * @return 변환된 CommentDTO
   */
  private CommentDTO convertToCommentDTO(Comment comment) {
    CommentDTO dto = new CommentDTO();
    dto.setId(comment.getId());
    dto.setText(comment.getText());
    dto.setAuthor(comment.getAuthor());
    dto.setCreatedAt(comment.getCreatedAt());
    dto.setUpdatedAt(comment.getUpdatedAt());
    return dto;
  }
}

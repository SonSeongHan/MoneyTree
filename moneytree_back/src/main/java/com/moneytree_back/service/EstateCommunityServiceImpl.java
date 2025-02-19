package com.moneytree_back.service;

import com.moneytree_back.domain.Comment;
import com.moneytree_back.domain.EstateCommunityPost;
import com.moneytree_back.domain.member.Member;
import com.moneytree_back.dto.CommentDTO;
import com.moneytree_back.dto.EstateCommunityPostDTO;
import com.moneytree_back.repository.CommentRepository;
import com.moneytree_back.repository.EstateCommunityPostRepository;
import com.moneytree_back.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EstateCommunityServiceImpl implements EstateCommunityService {

  private final EstateCommunityPostRepository postRepository;
  private final CommentRepository commentRepository;
  private final MemberRepository memberRepository;

  @Value("${moneytree_back.upload.path}")
  private String uploadPath;

  @Autowired
  public EstateCommunityServiceImpl(EstateCommunityPostRepository postRepository,
                                    CommentRepository commentRepository,
                                    MemberRepository memberRepository) {
    this.postRepository = postRepository;
    this.commentRepository = commentRepository;
    this.memberRepository = memberRepository;
  }

  private EstateCommunityPostDTO convertToDTO(EstateCommunityPost post) {
    EstateCommunityPostDTO dto = new EstateCommunityPostDTO();
    dto.setId(post.getId());
    dto.setTitle(post.getTitle());
    dto.setContent(post.getContent());
    // 작성자: Member 엔티티의 memberId 사용
    dto.setAuthor(post.getMember() != null ? post.getMember().getMemberId() : null);
    dto.setCreatedAt(post.getCreatedAt());
    dto.setUpdatedAt(post.getUpdatedAt());
    dto.setImageUrl(post.getImageUrl());
    dto.setImageFileName(post.getImageFileName());
    dto.setCategory(post.getCategory());
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
   * 댓글 필터(commentFilter)가 빈 문자열이면 Pageable 기반 쿼리로 처리하고,
   * 그렇지 않으면 전체 결과를 in‑memory로 가져와서 댓글 필터(“few”, “many”, “none”)를 적용한 후 수동 페이지네이션합니다.
   */
  @Override
  @Transactional
  public Page<EstateCommunityPostDTO> getAllPosts(int page, int size, String category, String searchField, String search, String commentFilter) {
    // commentFilter가 없으면 기존 방식으로 처리
    if (commentFilter == null || commentFilter.trim().isEmpty()) {
      Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
      Page<EstateCommunityPost> postPage;
      boolean isCategoryAll = (category == null || category.equals("전체보기"));
      boolean isSearchEmpty = (search == null || search.trim().isEmpty());

      if (isCategoryAll && isSearchEmpty) {
        postPage = postRepository.findAll(pageable);
      } else if (!isCategoryAll && isSearchEmpty) {
        postPage = postRepository.findByCategory(category, pageable);
      } else if (isCategoryAll && !isSearchEmpty) {
        switch (searchField) {
          case "title":
            postPage = postRepository.findByTitleContaining(search, pageable);
            break;
          case "content":
            postPage = postRepository.findByContentContaining(search, pageable);
            break;
          case "titleContent":
            postPage = postRepository.findByTitleContainingOrContentContaining(search, search, pageable);
            break;
          case "author":
            postPage = postRepository.findByMember_MemberIdContaining(search, pageable);
            break;
          default:
            postPage = postRepository.findAll(pageable);
            break;
        }
      } else {
        // 둘 다 조건이 있는 경우: 카테고리 필터 후 in‑memory 검색 필터링
        List<EstateCommunityPost> tempList = postRepository.findByCategory(category, pageable)
          .getContent().stream().filter(post -> {
            switch (searchField) {
              case "title":
                return post.getTitle() != null && post.getTitle().contains(search);
              case "content":
                return post.getContent() != null && post.getContent().contains(search);
              case "titleContent":
                return (post.getTitle() != null && post.getTitle().contains(search)) ||
                  (post.getContent() != null && post.getContent().contains(search));
              case "author":
                return post.getMember() != null && post.getMember().getMemberId().contains(search);
              default:
                return true;
            }
          }).collect(Collectors.toList());
        postPage = new PageImpl<>(tempList, pageable, tempList.size());
      }
      postPage.forEach(post -> post.getComments().size());
      List<EstateCommunityPostDTO> dtoList = postPage.stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
      return new PageImpl<>(dtoList, pageable, postPage.getTotalElements());
    }
    // commentFilter가 있는 경우: 전체 결과를 in‑memory로 가져온 후 필터링 및 정렬, 그 다음 수동 페이지네이션 진행
    else {
      // 전체 결과를 가져오기 위해 Sort.by("createdAt").descending() 사용
      Sort sort = Sort.by("createdAt").descending();
      List<EstateCommunityPost> allPosts;
      boolean isCategoryAll = (category == null || category.equals("전체보기"));
      boolean isSearchEmpty = (search == null || search.trim().isEmpty());

      if (isCategoryAll && isSearchEmpty) {
        allPosts = postRepository.findAll(sort);
      } else if (!isCategoryAll && isSearchEmpty) {
        allPosts = postRepository.findByCategory(category, sort);
      } else if (isCategoryAll && !isSearchEmpty) {
        switch (searchField) {
          case "title":
            allPosts = postRepository.findByTitleContaining(search, sort);
            break;
          case "content":
            allPosts = postRepository.findByContentContaining(search, sort);
            break;
          case "titleContent":
            allPosts = postRepository.findByTitleContainingOrContentContaining(search, search, sort);
            break;
          case "author":
            allPosts = postRepository.findByMember_MemberIdContaining(search, sort);
            break;
          default:
            allPosts = postRepository.findAll(sort);
            break;
        }
      } else {
        allPosts = postRepository.findByCategory(category, sort);
        allPosts = allPosts.stream().filter(post -> {
          switch (searchField) {
            case "title":
              return post.getTitle() != null && post.getTitle().contains(search);
            case "content":
              return post.getContent() != null && post.getContent().contains(search);
            case "titleContent":
              return (post.getTitle() != null && post.getTitle().contains(search)) ||
                (post.getContent() != null && post.getContent().contains(search));
            case "author":
              return post.getMember() != null && post.getMember().getMemberId().contains(search);
            default:
              return true;
          }
        }).collect(Collectors.toList());
      }

      // 댓글 필터 처리
      if (commentFilter.equals("few")) {
        allPosts = allPosts.stream()
          .sorted((p1, p2) -> Integer.compare(p1.getComments().size(), p2.getComments().size()))
          .collect(Collectors.toList());
      } else if (commentFilter.equals("many")) {
        allPosts = allPosts.stream()
          .sorted((p1, p2) -> Integer.compare(p2.getComments().size(), p1.getComments().size()))
          .collect(Collectors.toList());
      } else if (commentFilter.equals("none")) {
        allPosts = allPosts.stream()
          .filter(post -> post.getComments().isEmpty())
          .collect(Collectors.toList());
      }

      // 전체 결과 수
      int total = allPosts.size();
      // 수동 페이지네이션: 현재 페이지에 해당하는 부분을 subList로 추출
      int start = Math.min(page * size, total);
      int end = Math.min(start + size, total);
      List<EstateCommunityPost> paginatedPosts = allPosts.subList(start, end);

      List<EstateCommunityPostDTO> dtoList = paginatedPosts.stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());

      return new PageImpl<>(dtoList, PageRequest.of(page, size), total);
    }
  }

  @Override
  @Transactional
  public EstateCommunityPostDTO getPost(Long id) {
    EstateCommunityPost post = postRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. id: " + id));
    post.getComments().size();
    return convertToDTO(post);
  }

  @Override
  public EstateCommunityPostDTO createPost(String title, String content, MultipartFile image, String memberId, String category) {
    EstateCommunityPost post = new EstateCommunityPost();
    post.setTitle(title);
    post.setContent(content);

    Member member = memberRepository.findById(memberId)
      .orElseThrow(() -> new RuntimeException("Member not found: " + memberId));
    post.setMember(member);
    post.setCategory(category);

    if (image != null && !image.isEmpty()) {
      String absoluteUploadPath = System.getProperty("user.dir") + File.separator + uploadPath + File.separator;
      File uploadDirFile = new File(absoluteUploadPath);
      if (!uploadDirFile.exists()) {
        boolean created = uploadDirFile.mkdirs();
        System.out.println("업로드 폴더 생성 여부: " + created + ", 경로: " + uploadDirFile.getAbsolutePath());
      }
      try {
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

  @Override
  public EstateCommunityPostDTO updatePost(Long id, EstateCommunityPostDTO postDTO) {
    EstateCommunityPost existingPost = postRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. id: " + id));
    existingPost.setTitle(postDTO.getTitle());
    existingPost.setContent(postDTO.getContent());
    existingPost.setUpdatedAt(LocalDateTime.now());
    EstateCommunityPost updatedPost = postRepository.save(existingPost);
    return convertToDTO(updatedPost);
  }

  @Override
  public EstateCommunityPostDTO updatePostWithFile(Long id, String title, String content, MultipartFile image) {
    EstateCommunityPost existingPost = postRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. id: " + id));
    existingPost.setTitle(title);
    existingPost.setContent(content);
    if (image != null && !image.isEmpty()) {
      String absoluteUploadPath = System.getProperty("user.dir") + File.separator + uploadPath + File.separator;
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

  @Override
  public void deletePost(Long id) {
    EstateCommunityPost post = postRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. id: " + id));
    postRepository.delete(post);
  }

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

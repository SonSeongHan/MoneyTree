//package com.moneytree_back.service;
//
//import com.moneytree_back.domain.Comment;
//import com.moneytree_back.domain.EstateCommunityPost;
//import com.moneytree_back.repository.CommentRepository;
//import com.moneytree_back.repository.EstateCommunityPostRepository;
//import com.moneytree_back.service.EstateCommunityService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import javax.transaction.Transactional;
//import java.io.File;
//import java.io.IOException;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//@Transactional
//public class EstateCommunityServiceImpl implements EstateCommunityService {
//
//  @Autowired
//  private EstateCommunityPostRepository postRepository;
//
//  @Autowired
//  private CommentRepository commentRepository;
//
//  @Value("${file.upload-dir}")
//  private String uploadDir;
//
//  @Override
//  public EstateCommunityPost createPost(String title, String content, MultipartFile image) {
//    EstateCommunityPost post = EstateCommunityPost.builder()
//      .title(title)
//      .content(content)
//      .build();
//
//    if (image != null && !image.isEmpty()) {
//      String imageUrl = saveImage(image);
//      post.setImageUrl(imageUrl);
//    }
//
//    return postRepository.save(post);
//  }
//
//  @Override
//  public List<EstateCommunityPost> getAllPosts() {
//    return postRepository.findAll();
//  }
//
//  @Override
//  public Optional<EstateCommunityPost> getPost(Long id) {
//    return postRepository.findById(id);
//  }
//
//  @Override
//  public void deletePost(Long id) {
//    postRepository.deleteById(id);
//  }
//
//  @Override
//  public Comment addComment(Long postId, Comment comment) {
//    EstateCommunityPost post = postRepository.findById(postId)
//      .orElseThrow(() -> new IllegalArgumentException("해당 게시물이 존재하지 않습니다. ID: " + postId));
//    comment.setPost(post);
//    return commentRepository.save(comment);
//  }
//
//  private String saveImage(MultipartFile image) {
//    // 파일 저장 로직 (로컬 디렉토리에 저장)
//    String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
//    File dest = new File(uploadDir + File.separator + fileName);
//    try {
//      image.transferTo(dest);
//      return "/images/" + fileName; // 프론트엔드에서 접근 가능한 URL 경로
//    } catch (IOException e) {
//      throw new RuntimeException("이미지 저장에 실패했습니다.", e);
//    }
//  }
//}

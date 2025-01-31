//package com.moneytree_back.service;
//
//import com.moneytree_back.domain.Comment;
//import com.moneytree_back.domain.EstateCommunityPost;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.util.List;
//import java.util.Optional;
//
//public interface EstateCommunityService {
//  EstateCommunityPost createPost(String title, String content, MultipartFile image);
//  List<EstateCommunityPost> getAllPosts();
//  Optional<EstateCommunityPost> getPost(Long id);
//  void deletePost(Long id);
//  Comment addComment(Long postId, Comment comment);
//}

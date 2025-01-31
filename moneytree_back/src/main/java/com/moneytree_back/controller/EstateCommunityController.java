//package com.moneytree_back.controller;
//
//import com.moneytree_back.domain.Comment;
//import com.moneytree_back.domain.EstateCommunityPost;
//import com.moneytree_back.service.EstateCommunityService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/estate-community")
//@CrossOrigin(origins = "http://localhost:3000")
//public class EstateCommunityController {
//
//  @Autowired
//  private EstateCommunityService estateCommunityService;
//
//  @PostMapping
//  public ResponseEntity<EstateCommunityPost> createPost(
//    @RequestParam String title,
//    @RequestParam String content,
//    @RequestParam(required = false) MultipartFile image) {
//    return ResponseEntity.ok(estateCommunityService.createPost(title, content, image));
//  }
//
//  @GetMapping
//  public List<EstateCommunityPost> getAllPosts() {
//    return estateCommunityService.getAllPosts();
//  }
//
//  @GetMapping("/{id}")
//  public ResponseEntity<EstateCommunityPost> getPost(@PathVariable Long id) {
//    return estateCommunityService.getPost(id)
//      .map(ResponseEntity::ok)
//      .orElse(ResponseEntity.notFound().build());
//  }
//
//  @DeleteMapping("/{id}")
//  public ResponseEntity<Void> deletePost(@PathVariable Long id) {
//    estateCommunityService.deletePost(id);
//    return ResponseEntity.noContent().build();
//  }
//
//  @PostMapping("/{id}/comments")
//  public ResponseEntity<Comment> addComment(@PathVariable Long id, @RequestBody Comment comment) {
//    return ResponseEntity.ok(estateCommunityService.addComment(id, comment));
//  }
//}

//package com.moneytree_back.domain;
//
//import jakarta.persistence.*;
//import lombok.*;
//
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//@Table(name = "estate_community_posts")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class EstateCommunityPost {
//
//  @Id
//  @GeneratedValue(strategy = GenerationType.IDENTITY)
//  private Long id;
//
//  private String title;
//
//  @Column(columnDefinition = "TEXT")
//  private String content;
//
//  private String imageUrl;
//
//  private LocalDateTime createdAt;
//
//  private LocalDateTime updatedAt;
//
//  @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
//  private List<Comment> comments = new ArrayList<>();
//
//  @PrePersist
//  protected void onCreate() {
//    createdAt = LocalDateTime.now();
//    updatedAt = createdAt;
//  }
//
//  @PreUpdate
//  protected void onUpdate() {
//    updatedAt = LocalDateTime.now();
//  }
//}

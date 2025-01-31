//package com.moneytree_back.domain;
//
//import jakarta.persistence.*;
//import lombok.*;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "comments")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class Comment {
//
//  @Id
//  @GeneratedValue(strategy = GenerationType.IDENTITY)
//  private Long id;
//
//  @Column(columnDefinition = "TEXT")
//  private String content;
//
//  private LocalDateTime createdAt;
//
//  @ManyToOne(fetch = FetchType.LAZY)
//  @JoinColumn(name = "post_id")
//  private EstateCommunityPost post;
//
//  @PrePersist
//  protected void onCreate() {
//    createdAt = LocalDateTime.now();
//  }
//}

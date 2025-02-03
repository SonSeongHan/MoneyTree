//package com.moneytree_back.domain;
//
//import com.fasterxml.jackson.annotation.JsonBackReference;
//import jakarta.persistence.*;
//
//@Entity
//public class PostImage {
//
//  @Id
//  @GeneratedValue(strategy = GenerationType.IDENTITY)
//  private Long id;
//
//  private String imageUrl;
//  private String imageFileName;
//
//  @ManyToOne(fetch = FetchType.LAZY)
//  @JoinColumn(name = "post_id")
//  @JsonBackReference(value = "postImages")
//  private EstateCommunityPost post;
//
//  public PostImage() {}
//
//  // Getter, Setter
//  public Long getId() {
//    return id;
//  }
//  public void setId(Long id) {
//    this.id = id;
//  }
//  public String getImageUrl() {
//    return imageUrl;
//  }
//  public void setImageUrl(String imageUrl) {
//    this.imageUrl = imageUrl;
//  }
//  public String getImageFileName() {
//    return imageFileName;
//  }
//  public void setImageFileName(String imageFileName) {
//    this.imageFileName = imageFileName;
//  }
//  public EstateCommunityPost getPost() {
//    return post;
//  }
//  public void setPost(EstateCommunityPost post) {
//    this.post = post;
//  }
//}

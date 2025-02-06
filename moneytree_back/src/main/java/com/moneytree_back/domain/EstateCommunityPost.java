package com.moneytree_back.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "estate_community_post")
public class EstateCommunityPost {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;
  private String content;

  // Member와의 연관관계로 작성자 정보를 저장 (DB에는 member_id 컬럼으로 저장)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "member_id")
  private Member member;

  // 새로 추가된 카테고리 필드
  private String category;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // 댓글 목록 – 양방향 관계에서 순환 참조 방지를 위해
  @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference
  private List<Comment> comments = new ArrayList<>();

  // 단일 파일 업로드용 필드
  private String imageUrl;
  private String imageFileName;

  public EstateCommunityPost() {}

  // Getter 및 Setter

  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }
  public void setTitle(String title) {
    this.title = title;
  }

  public String getContent() {
    return content;
  }
  public void setContent(String content) {
    this.content = content;
  }

  public Member getMember() {
    return member;
  }
  public void setMember(Member member) {
    this.member = member;
  }

  // 새로 추가된 category 필드에 대한 getter/setter
  public String getCategory() {
    return category;
  }
  public void setCategory(String category) {
    this.category = category;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }
  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }
  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public List<Comment> getComments() {
    return comments;
  }
  public void setComments(List<Comment> comments) {
    this.comments = comments;
  }

  public String getImageUrl() {
    return imageUrl;
  }
  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
  }

  public String getImageFileName() {
    return imageFileName;
  }
  public void setImageFileName(String imageFileName) {
    this.imageFileName = imageFileName;
  }
}

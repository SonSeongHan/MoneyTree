package com.moneytree_back.dto;

import java.time.LocalDateTime;
import java.util.List;

public class EstateCommunityPostDTO {
  private Long id;
  private String title;
  private String content;
  private String author;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private String imageUrl;
  private String imageFileName;
  private List<CommentDTO> comments;

  public EstateCommunityPostDTO() {}

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
  public String getAuthor() {
    return author;
  }
  public void setAuthor(String author) {
    this.author = author;
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
  public List<CommentDTO> getComments() {
    return comments;
  }
  public void setComments(List<CommentDTO> comments) {
    this.comments = comments;
  }
}

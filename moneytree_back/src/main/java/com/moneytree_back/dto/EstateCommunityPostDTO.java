package com.moneytree_back.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * EstateCommunityPostDTO는 게시글 정보를 클라이언트에 전달하기 위한 데이터 전송 객체입니다.
 * 필드:
 *  - id: 게시글의 고유 식별자
 *  - title: 게시글 제목
 *  - content: 게시글 내용
 *  - author: 게시글 작성자
 *  - createdAt: 게시글 작성 시간
 *  - updatedAt: 게시글 수정 시간
 *  - imageUrl: 업로드된 이미지의 URL
 *  - imageFileName: 업로드된 이미지의 원본 파일명
 *  - comments: 해당 게시글에 달린 댓글 목록 (CommentDTO 리스트)
 */
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

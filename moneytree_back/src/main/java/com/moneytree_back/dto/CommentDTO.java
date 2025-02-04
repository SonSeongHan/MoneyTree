package com.moneytree_back.dto;

import java.time.LocalDateTime;

/**
 * CommentDTO는 댓글 정보를 클라이언트에 전달하기 위한 데이터 전송 객체입니다.
 * 필드:
 *  - id: 댓글의 고유 식별자
 *  - text: 댓글 내용
 *  - author: 댓글 작성자
 *  - createdAt: 댓글 작성 시간
 *  - updatedAt: 댓글 수정 시간
 */
public class CommentDTO {
  private Long id;
  private String text;
  private String author;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public CommentDTO() {}

  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }
  public String getText() {
    return text;
  }
  public void setText(String text) {
    this.text = text;
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
}

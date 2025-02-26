package com.moneytree_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommunityDTO {
    private Long postId;
    private String memberId;
    private String postType;
    private String title;
    private String content;
    private List<String> imageUrls;
    private String membershipType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> deletedImages; // 삭제할 이미지 목록
    private String category;  // 카테고리 추가
    private int commentCount; // 댓글 개수 추가

    public CommunityDTO(Long postId, String memberId, String postType, String title, String content,
                        List<String> imageUrls, String membershipType, LocalDateTime createdAt,
                        LocalDateTime updatedAt, String category, int commentCount) {
        this.postId = postId;
        this.memberId = memberId;
        this.postType = postType;
        this.title = title;
        this.content = content;
        this.imageUrls = imageUrls;
        this.membershipType = membershipType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.category = category;
        this.commentCount = commentCount;
    }
}




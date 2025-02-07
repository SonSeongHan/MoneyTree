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

    private List<String> deletedImages; // 삭제할 이미지 목록 추가




}


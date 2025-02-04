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



//    public CommunityDTO(Long postId, String memberId, String postType, String title, String content, String imageUrl, String membershipType) {
//        this.postId = postId;
//        this.memberId = memberId;
//        this.postType = postType;
//        this.title = title;
//        this.content = content;
//        this.imageUrl = imageUrl;
//        this.membershipType = membershipType;
//        this.createdAt = LocalDateTime.now();
//        this.updatedAt = LocalDateTime.now();
//    }


}


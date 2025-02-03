package com.moneytree_back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommunityDTO {
    private Long postId;
    private String memberId;
    private String postType;
    private String title;
    private String content;
    private String imageUrl;
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


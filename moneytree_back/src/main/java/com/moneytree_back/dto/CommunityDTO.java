package com.moneytree_back.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommunityDTO {
    private Long postId;
    //    private String member; 나중에 로그인 유저 로직 짜여지면 사용가능
    private String postType;
    private String memberType;
    private String title;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

   public CommunityDTO() {}

    public CommunityDTO(Long postId,String postType, String memberType, String title, String content, String imageUrl) {
        this.postId = postId;
        this.postType = postType;
        this.memberType = memberType;
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }


}


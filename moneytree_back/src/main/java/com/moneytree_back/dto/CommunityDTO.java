package com.moneytree_back.dto;

import lombok.Data;

@Data
public class CommunityDTO {
    private Long id;
    //    private String member; 나중에 로그인 유저 로직 짜여지면 사용가능
    private String memberType;
    private String title;
    private String content;
    private String imageUrl;

   public CommunityDTO() {}

    public CommunityDTO(Long id, String memberType, String title, String content, String imageUrl) {
        this.id = id;
        this.memberType = memberType;
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
    }
}


package com.moneytree_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommunityRepliesDTO {
    private Long replyId;
    private Long postId;
    private String memberId;
    private String membershipType;
    private String content;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
    private Boolean is_deleted; // 추가: 삭제 여부, 기본 false가 기대됨
}

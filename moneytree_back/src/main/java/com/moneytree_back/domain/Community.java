package com.moneytree_back.domain;

import com.moneytree_back.domain.CommunityImage;
import com.moneytree_back.domain.CommunityReplies;
import com.moneytree_back.domain.PostType;
import com.moneytree_back.domain.member.Member;
import com.moneytree_back.domain.member.MembershipType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "community")
@Getter
@Setter
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long postId;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_type")
    private MembershipType membershipType;

    @Enumerated(EnumType.STRING)
    @Column(name = "post_type")
    private PostType postType;

    @Column(name="title",nullable = false)
    private String title;

    @Column(name="content",nullable = false)
    private String content;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "category")
    private String category;

    @ManyToOne
    @JoinColumn(name = "member_id",nullable = false)
    private Member member;

    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CommunityImage> images = new ArrayList<>(); // 초기값 설정

    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CommunityReplies> replies = new ArrayList<>(); // 초기값 설정

    // 댓글 개수 반환 메서드 (CommunityReplies 기준으로 카운팅)
    public int getCommentCount() {
        return replies != null ? replies.size() : 0;
    }
}

package com.moneytree_back.domain;


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

    @ManyToOne
    @JoinColumn(name = "member_id",nullable = false)
    private Member member;

    @OneToMany(mappedBy = "community",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityImage> images;

    @OneToMany(mappedBy = "community",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityReplies> replies = new ArrayList<>();

}

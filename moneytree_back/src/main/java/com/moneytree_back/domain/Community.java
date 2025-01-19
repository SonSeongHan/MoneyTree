package com.moneytree_back.domain;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
    private Long id;

//MemberType을 도메인에 생성했지만 테이블의 현재 상태는 NOT NULL이 아니므로 NULL 상태도 통과됨
    @Enumerated(EnumType.STRING)
    @Column(name = "member_type")
    private MemberType memberType;

//    @Column(name = "member_type")
//    private String member;

    @Column(name="title",nullable = false)
    private String title;

    @Column(name="content",nullable = false)
    private String content;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;



}

package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="community_images")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class CommunityImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @ManyToOne
    @JoinColumn(name = "post_id",nullable = false)
    private Community community;

    @Column(name = "image_url")
    private String imageUrl;
}

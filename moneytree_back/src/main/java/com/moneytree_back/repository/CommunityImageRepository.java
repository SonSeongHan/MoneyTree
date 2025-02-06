package com.moneytree_back.repository;

import com.moneytree_back.domain.CommunityImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CommunityImageRepository extends JpaRepository<CommunityImage,Long> {
    void deleteByImageUrl(String imageUrl); // ✅ 기존: 한 개만 삭제

    @Transactional
    @Modifying
    @Query("DELETE FROM CommunityImage c WHERE c.imageUrl IN :imageUrls")
    void deleteByImageUrlIn(@Param("imageUrls") List<String> imageUrls);

    @Modifying
    @Transactional
    @Query("DELETE FROM CommunityImage c WHERE c.community.postId = :postId") // ✅ 특정 게시글의 모든 이미지 삭제
    void deleteByCommunityId(Long postId);

    List<CommunityImage> findByImageUrlIn(List<String> imageUrls);

}

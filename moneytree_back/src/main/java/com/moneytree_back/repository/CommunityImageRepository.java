package com.moneytree_back.repository;

import com.moneytree_back.domain.Community;
import com.moneytree_back.domain.CommunityImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityImageRepository extends JpaRepository<CommunityImage,Long> {
    List<CommunityImage> findByCommunity(Community community);
    void deleteByCommunity(Community community);

}

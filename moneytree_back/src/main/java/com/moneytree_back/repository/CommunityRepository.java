package com.moneytree_back.repository;

import com.moneytree_back.domain.Community;
import com.moneytree_back.domain.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityRepository extends JpaRepository<Community, Long> {

    Page<Community> findByPostType(PostType postType, Pageable pageable);
}


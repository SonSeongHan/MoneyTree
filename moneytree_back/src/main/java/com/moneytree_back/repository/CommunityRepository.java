package com.moneytree_back.repository;

import com.moneytree_back.domain.Community;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityRepository extends JpaRepository<Community, Long> {

    //커뮤니티에서 페이지 형식으로 조회
//    Page<Community> findById(Pageable pageable);
}


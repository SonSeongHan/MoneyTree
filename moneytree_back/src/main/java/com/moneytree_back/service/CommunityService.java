package com.moneytree_back.service;


import com.moneytree_back.domain.PostType;
import com.moneytree_back.dto.CommunityDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommunityService {

    //커뮤 글 추가
    void saveCommunity(CommunityDTO communityDTO);
    //커뮤 글 불러오기(페이지 형식)
    Page<CommunityDTO> getPagedAllCommunity(PostType postType, Pageable pageable);
    //커뮤 글 조회
    CommunityDTO getCommunityById(Long postId);
    //커뮤 글 수정
    void updateCommunity(CommunityDTO communityDTO);
    //커뮤 글 삭제
    void deleteCommunity(Long postId);

}

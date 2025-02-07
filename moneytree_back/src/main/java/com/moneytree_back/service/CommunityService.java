package com.moneytree_back.service;


import com.moneytree_back.domain.PostType;
import com.moneytree_back.dto.CommunityDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CommunityService {

    //커뮤 글 추가
    CommunityDTO saveCommunity(CommunityDTO communityDTO, List<MultipartFile> files);
    //커뮤 글 불러오기(페이지 형식)
    Page<CommunityDTO> getPagedAllCommunity(PostType postType, Pageable pageable);
    //커뮤 글 조회
    CommunityDTO getCommunityById(Long postId);
    //커뮤 글 수정
    void updateCommunity(CommunityDTO communityDTO, List<MultipartFile> files,List<String> deletedImages);
    //커뮤 글 삭제
    void deleteCommunity(Long postId);

}

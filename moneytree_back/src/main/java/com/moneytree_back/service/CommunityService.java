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

    // 커뮤 글 불러오기(페이지 형식) - 카테고리 필터링을 추가
    Page<CommunityDTO> getPagedAllCommunity(PostType postType, String category, Pageable pageable);

    //커뮤 글 조회
    CommunityDTO getCommunityById(Long postId);

    //커뮤 글 수정
    void updateCommunity(CommunityDTO communityDTO, List<MultipartFile> files, List<String> deletedImages);

    //커뮤 글 삭제
    void deleteCommunity(Long postId);
    // 댓글 많은 순으로 게시글 조회
    Page<CommunityDTO> getPagedAllCommunityByCommentCountDesc(PostType postType, Pageable pageable);

    // 댓글 적은 순으로 게시글 조회
    Page<CommunityDTO> getPagedAllCommunityByCommentCountAsc(PostType postType, Pageable pageable);

    // 기본적으로 댓글 수 상관없이 모든 게시글 반환
    Page<CommunityDTO> getPagedAllCommunityByPostType(PostType postType, Pageable pageable);


}

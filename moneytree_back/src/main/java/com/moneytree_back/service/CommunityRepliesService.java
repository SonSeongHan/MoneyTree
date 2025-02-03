package com.moneytree_back.service;

import com.moneytree_back.dto.CommunityRepliesDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface
CommunityRepliesService {

    //커뮤 글 답글 추가
    void saveCommunityReplies(CommunityRepliesDTO communityRepliesDTO);
    //커뮤 답글 불러오기(페이지 형식)
    Page<CommunityRepliesDTO> getRepliesByPostId(Long postId,Pageable pageable);
    //커뮤 글 조회
    CommunityRepliesDTO getCommunityRepliesById(Long replyId);
    //커뮤 글 수정
    void updateCommunityRepliesById(CommunityRepliesDTO communityRepliesDTO);
    //커뮤 글 삭제
    void deleteCommunityRepliesById(Long replyId);
}

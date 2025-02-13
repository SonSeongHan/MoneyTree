package com.moneytree_back.service;

import com.moneytree_back.domain.Community;
import com.moneytree_back.domain.CommunityReplies;
import com.moneytree_back.domain.member.Member;
import com.moneytree_back.dto.CommunityRepliesDTO;
import com.moneytree_back.repository.CommunityRepliesRepository;
import com.moneytree_back.repository.CommunityRepository;
import com.moneytree_back.repository.MemberRepository;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Log4j2
@Service
public class CommunityRepliesServiceImpl implements CommunityRepliesService {

    private final CommunityRepliesRepository communityRepliesRepository;
    private final MemberRepository memberRepository;
    private final CommunityRepository communityRepository;

    public CommunityRepliesServiceImpl(
            CommunityRepliesRepository communityRepliesRepository,
            MemberRepository memberRepository,
            CommunityRepository communityRepository) {
        this.communityRepliesRepository = communityRepliesRepository;
        this.memberRepository = memberRepository;
        this.communityRepository = communityRepository;
    }


    @Override
    public void saveCommunityReplies(CommunityRepliesDTO communityRepliesDTO) {
        log.info("멤버 조회를 위한 memberId: {}", communityRepliesDTO.getMemberId());

        Community community = communityRepository.findById(communityRepliesDTO.getPostId())
                .orElseThrow(() -> new RuntimeException("Community not found"));
        Member member = memberRepository.findByMemberId(communityRepliesDTO.getMemberId())
                .orElseThrow(() -> new RuntimeException("Member not found"));

        log.info("멤버 조회 결과:{}", communityRepliesDTO.getMemberId());

        CommunityReplies communityReplies = CommunityReplies.builder()
                .community(community)
                .member(member)
                .membershipType(member.getMembershipType())
                .content(communityRepliesDTO.getContent())
                .build();

        communityRepliesRepository.save(communityReplies);
    }



    //커뮤 답글 페이지 형식으로 불러오기
    @Override
    public Page<CommunityRepliesDTO> getRepliesByPostId(Long postId,Pageable pageable) {
         return communityRepliesRepository.findByCommunityPostId(postId, pageable)
                 .map(reply -> CommunityRepliesDTO.builder()
                         .replyId((long) reply.getReplyId())
                         .postId(reply.getCommunity().getPostId())
                         .memberId(reply.getMember().getMemberId())
                         .membershipType(reply.getMember().getMembershipType().name()) // 추가: 실제 회원 등급 설정
                         .content(reply.getContent())
                         .created_at(reply.getCreatedAt())
                         .updated_at(reply.getUpdateAt())
                         .build());
    }

    @Override
    public CommunityRepliesDTO getCommunityRepliesById(Long replyId) {
        CommunityReplies reply = communityRepliesRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));
        return CommunityRepliesDTO.builder()
                .replyId((long) reply.getReplyId())
                .postId(reply.getCommunity().getPostId())
                .memberId(reply.getMember().getMemberId())
                .membershipType(reply.getMembershipType().name())
                .content(reply.getContent())
                .created_at(reply.getCreatedAt())
                .updated_at(reply.getUpdateAt())
                .build();
    }

    @Override
    public void updateCommunityRepliesById(CommunityRepliesDTO communityRepliesDTO) {

        CommunityReplies reply = communityRepliesRepository.findById(communityRepliesDTO.getReplyId())
                .orElseThrow(()->new RuntimeException("Reply not found"));
        reply.setContent(communityRepliesDTO.getContent());
        communityRepliesRepository.save(reply);
    }

    @Override
    public void deleteCommunityRepliesById(Long replyId) {
         CommunityReplies reply =communityRepliesRepository.findById(replyId)
                 .orElseThrow(() -> new RuntimeException("Reply not found"));

         log.info("지우려는 replyId: {}", reply.getReplyId());

         communityRepliesRepository.deleteById(replyId);
    }
}

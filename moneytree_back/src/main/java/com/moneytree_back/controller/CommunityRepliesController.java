package com.moneytree_back.controller;

import com.moneytree_back.dto.CommunityRepliesDTO;
import com.moneytree_back.service.CommunityRepliesService;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Log4j2
@RestController
@RequestMapping("/api/community/replies")
public class CommunityRepliesController {

    private final CommunityRepliesService communityRepliesService;

    public CommunityRepliesController(CommunityRepliesService communityRepliesService) {
        this.communityRepliesService = communityRepliesService;
    }

    //답글 등록하기
    @PostMapping
    @PreAuthorize("hasAnyRole('SimpleMember','FullMember','ADMIN','InquiryManager')")
    public ResponseEntity<CommunityRepliesDTO> createReply(
            @RequestBody CommunityRepliesDTO communityRepliesDTO) {

        log.info(" 프론트에서 받은 DTO: {}", communityRepliesDTO);

        communityRepliesService.saveCommunityReplies(communityRepliesDTO);
        return ResponseEntity.ok(communityRepliesDTO);
    }


    //페이징 형식으로 불러오기
    @GetMapping("/{postId}/page-replies")
    public ResponseEntity<Page<CommunityRepliesDTO>> getRepliesByPostId(
            @PathVariable Long postId,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {

        Page<CommunityRepliesDTO> result = communityRepliesService.getRepliesByPostId(postId,pageable);

        return ResponseEntity.ok(result);
    }

    //조회하기
    @GetMapping("/{replyId}")
    public CommunityRepliesDTO getCommunityRepliesById(@PathVariable Long replyId) {

        return communityRepliesService.getCommunityRepliesById(replyId);

    }

    @PutMapping("/{replyId}")
    @PreAuthorize("hasAnyRole('SimpleMember','FullMember','ADMIN','InquiryManager')")
    public ResponseEntity<CommunityRepliesDTO> updateReply(
            @PathVariable Long replyId,
            @RequestBody CommunityRepliesDTO communityRepliesDTO) {
        communityRepliesDTO.setReplyId(replyId);
        communityRepliesService.updateCommunityRepliesById(communityRepliesDTO);
        return ResponseEntity.ok(communityRepliesDTO);
    }


    @DeleteMapping("/{replyId}")
    @PreAuthorize("hasAnyRole('SimpleMember','FullMember','ADMIN','InquiryManager')")
    public void deleteReply(@PathVariable Long replyId) {

        log.info("지우려는 replyId: {}", replyId);
        communityRepliesService.deleteCommunityRepliesById(replyId);
    }

}

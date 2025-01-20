package com.moneytree_back.controller;

import com.moneytree_back.domain.PostType;
import com.moneytree_back.dto.CommunityDTO;
import com.moneytree_back.service.CommunityService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    //페이지 형식으로 불러오기
    @GetMapping
    public ResponseEntity<Page<CommunityDTO>> getPagedCommunities(
            @RequestParam(value="postType",required = false) PostType postType,
            @PageableDefault(page = 0, size = 10) Pageable pageable){

        Page<CommunityDTO> result = communityService.getPagedAllCommunity(postType,pageable);

        return ResponseEntity.ok(result);
    }
//조회
    @GetMapping("/{postId}")
    public ResponseEntity<CommunityDTO> getCommunityById(@PathVariable Long postId){
        CommunityDTO result = communityService.getCommunityById(postId);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<CommunityDTO> saveCommunity(@RequestBody CommunityDTO communityDTO){
        communityService.saveCommunity(communityDTO);
        return ResponseEntity.status(201).body(communityDTO);
    }

    @PutMapping("/update/{postId}")
    public ResponseEntity<CommunityDTO> updateCommunity(
            @PathVariable Long postId,
            @RequestBody CommunityDTO communityDTO){
        communityDTO.setPostId(postId);
        communityService.updateCommunity(communityDTO);
        return ResponseEntity.ok(communityDTO);
    }

    @DeleteMapping("/delete/{postId}")
    public void deleteCommunity(@PathVariable Long postId){
        communityService.deleteCommunity(postId);
    }



}

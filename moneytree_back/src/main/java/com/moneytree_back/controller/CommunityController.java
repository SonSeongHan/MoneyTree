package com.moneytree_back.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree_back.domain.PostType;
import com.moneytree_back.dto.CommunityDTO;
import com.moneytree_back.service.CommunityService;
import com.moneytree_back.util.CustomFileUtil;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.nio.file.Path;
import java.io.File;
import java.io.IOException;
import java.util.List;


@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    private final CommunityService communityService;
    private final CustomFileUtil customFileUtil;

    public CommunityController(CommunityService communityService, CustomFileUtil customFileUtil) {
        this.communityService = communityService;
        this.customFileUtil = customFileUtil;
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
    public ResponseEntity<CommunityDTO> saveCommunity(
            @RequestParam("communityDTO") String communityDTOJson,
            @RequestParam(value = "files",required = false) List<MultipartFile> files){

        //JSON 문자열로 전달된 communityDTO를 객체로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        CommunityDTO communityDTO;
        try{
            communityDTO = objectMapper.readValue(communityDTOJson,CommunityDTO.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("커뮤니티 DTO 파싱 실패ㅜ",e);
        }

        //파일 저장 처리(필요 시)
        if(files != null && !files.isEmpty()){
            List<String> savedFileNames = customFileUtil.saveFiles(files);
            communityDTO.setImageUrl(savedFileNames.get(0));
        }

        communityService.saveCommunity(communityDTO);
        return ResponseEntity.status(201).body(communityDTO);
    }

    @GetMapping("/files/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        return customFileUtil.getFile(fileName);
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
    public ResponseEntity<Void> deleteCommunity(@PathVariable Long postId){
        communityService.deleteCommunity(postId);
        return ResponseEntity.noContent().build();
    }


}

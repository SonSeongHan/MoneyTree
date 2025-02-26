package com.moneytree_back.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.moneytree_back.domain.PostType;
import com.moneytree_back.dto.CommunityDTO;
import com.moneytree_back.service.CommunityService;
import com.moneytree_back.util.CustomFileUtil;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Log4j2
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
            @RequestParam(value = "postType", required = false) PostType postType,
            @RequestParam(value = "category", required = false) String category,  // 카테고리 파라미터 추가
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<CommunityDTO> result = communityService.getPagedAllCommunity(postType, category, pageable);

        return ResponseEntity.ok(result);
    }
    //조회
    @GetMapping("/{postId}")
    public ResponseEntity<CommunityDTO> getCommunityById(@PathVariable Long postId){
        CommunityDTO result = communityService.getCommunityById(postId);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SimpleMember','FullMember','ADMIN','InquiryManager')")
    public ResponseEntity<CommunityDTO> saveCommunity(
            @RequestParam("communityDTO") String communityDTOJson, // ✅ JSON 문자열 받기
            @RequestParam(value = "files",required = false) List<MultipartFile> files){

        log.info("커뮤니티DTO 받은 값들: {}", communityDTOJson);

        //JSON 문자열로 전달된 communityDTO를 객체로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // LocalDateTime 지원 모듈 등록
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false); // 알 수 없는 필드 무시
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,false); // ISO-8601 포맷 사용 설정

        CommunityDTO communityDTO;

        try{
            communityDTO = objectMapper.readValue(communityDTOJson,CommunityDTO.class);
            log.info("커뮤니티DTO 받은 값들: {}" , communityDTO); // 디버그용 로그
        } catch (JsonProcessingException e) {
            log.error("커뮤니티 DTO 파싱 실패: {}", e.getMessage());
            throw new RuntimeException("커뮤니티 DTO 파싱 실패ㅜ",e);
        }

        // memberId가 null일 경우 예외 처리
        if (communityDTO.getMemberId() == null || communityDTO.getMemberId().isEmpty()) {
            throw new IllegalArgumentException("Member ID is missing.");
        }

        communityService.saveCommunity(communityDTO,files);
        return ResponseEntity.status(201).body(communityDTO);
    }

    @GetMapping("/files/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        return customFileUtil.getFile(fileName);
    }

    @PutMapping("/update/{postId}")
    @PreAuthorize("hasAnyRole('SimpleMember','FullMember','ADMIN','InquiryManager')")
    public ResponseEntity<CommunityDTO> updateCommunity(
            @PathVariable Long postId,
            @RequestPart("CommunityDTO") String communityDTOJson,
            @RequestPart(value = "files",required = false) List<MultipartFile> files,
            @RequestPart(value = "deletedImages",required = false) String deletedImagesJson) {

        log.info("받은 삭제할 이미지 JSON: {}", deletedImagesJson);

        //JSON 문자열을 List<String>으로 변환
        List<String> deletedImages = new ArrayList<>();
        if (deletedImagesJson != null && !deletedImagesJson.isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                deletedImages = objectMapper.readValue(deletedImagesJson, new TypeReference<>() {
                });
            } catch (JsonProcessingException e) {
                log.error(" 삭제할 이미지 변환 중 오류 발생", e);
            }
        }

        log.info(" 변환된 삭제할 이미지 리스트: {}", deletedImages);

        // JSON 문자열을 객체로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // LocalDateTime 지원
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

        CommunityDTO communityDTO;
        try {
            communityDTO = objectMapper.readValue(communityDTOJson, CommunityDTO.class);
            log.info("업데이트할 커뮤니티DTO: {}", communityDTO);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("커뮤니티 DTO 파싱 실패", e);
        }
        communityDTO.setPostId(postId);
        log.info("communityDTO.setPostId(postId): {}", communityDTO);
        communityService.updateCommunity(communityDTO,files,deletedImages);
        return ResponseEntity.status(201).body(communityDTO);
    }

    @DeleteMapping("/delete/{postId}")
    @PreAuthorize("hasAnyRole('SimpleMember','FullMember','ADMIN','InquiryManager')")
    public ResponseEntity<Void> deleteCommunity(@PathVariable Long postId){
        communityService.deleteCommunity(postId);
        return ResponseEntity.noContent().build();
    }

    // 댓글 많은 순으로 게시글 조회
    @GetMapping("/community/most-comments")
    public Page<CommunityDTO> getCommunitiesByMostComments(@RequestParam PostType postType, Pageable pageable) {
        return communityService.getPagedAllCommunityByCommentCountDesc(postType, pageable);
    }

    // 댓글 적은 순으로 게시글 조회
    @GetMapping("/community/least-comments")
    public Page<CommunityDTO> getCommunitiesByLeastComments(@RequestParam PostType postType, Pageable pageable) {
        return communityService.getPagedAllCommunityByCommentCountAsc(postType, pageable);
    }

    // 댓글 필터링 기능 (많은 순 / 적은 순)
    @GetMapping("/community/hobby")
    public Page<CommunityDTO> getCommunitiesByCommentFilter(
            @RequestParam String category,
            @RequestParam int page,
            @RequestParam String commentFilter, // commentFilter (many/few)
            Pageable pageable) {

        // 페이지 번호와 category를 고려한 Pageable 설정
        pageable = Pageable.ofSize(pageable.getPageSize()).withPage(page);

        // 댓글 필터링에 맞춰 호출
        if ("many".equalsIgnoreCase(commentFilter)) {
            return communityService.getPagedAllCommunityByCommentCountDesc(PostType.HOBBY, pageable); // 댓글 많은 순
        } else if ("few".equalsIgnoreCase(commentFilter)) {
            return communityService.getPagedAllCommunityByCommentCountAsc(PostType.HOBBY, pageable); // 댓글 적은 순
        }

        // 기본적으로 댓글 수 상관없이 모든 게시글 반환 (필터가 잘못되었을 경우)
        return communityService.getPagedAllCommunityByPostType(PostType.HOBBY, pageable);
    }

}




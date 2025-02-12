package com.moneytree_back.service;

import com.moneytree_back.domain.Community;
import com.moneytree_back.domain.CommunityImage;
import com.moneytree_back.domain.member.Member;
import com.moneytree_back.domain.PostType;
import com.moneytree_back.dto.CommunityDTO;
import com.moneytree_back.repository.CommunityImageRepository;
import com.moneytree_back.repository.CommunityRepository;
import com.moneytree_back.repository.MemberRepository;
import com.moneytree_back.util.CustomFileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;
    private final MemberRepository memberRepository;
    private final CommunityImageRepository communityImageRepository;
    private final CustomFileUtil customFileUtil;
    private final CommunityRepliesRepository communityRepliesRepository;

    @Override
    public Page<CommunityDTO> getPagedAllCommunity(PostType postType,Pageable pageable) {
        Page<Community> communities;

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);



        if(postType == null){
            communities = communityRepository.findAll(sortedPageable);
        }
        else{
            communities = communityRepository.findAllByPostType(postType, sortedPageable);
        }

        return communities.map(community -> new CommunityDTO(
                community.getPostId(),
                community.getMember() != null ? community.getMember().getMemberId() : null, // Member ID
                community.getPostType().name(),
                community.getTitle(),
                community.getContent(),
                community.getImages().stream()
                        .map(CommunityImage::getImageUrl)
                        .collect(Collectors.toList()),
                community.getMembershipType() != null ? community.getMembershipType().name() : null,
                community.getCreatedAt(),
                community.getUpdatedAt(),
                null
        ));
    }

    @Override
    public CommunityDTO getCommunityById(Long postId){

        Community community = communityRepository.findById(postId).orElseThrow(()-> new RuntimeException("해당 커뮤니티 글을 찾을 수 없습니다."));

        List<String> imageUrls = community.getImages().stream()
                .map(CommunityImage::getImageUrl)
                .collect(Collectors.toList());

        log.info("해당 게시글의 기존 이미지 리스트:{}", imageUrls);

        return new CommunityDTO(
                community.getPostId(),
                community.getMember() != null ? community.getMember().getMemberId() : null, // Member ID
                community.getPostType().name(),
                community.getTitle(),
                community.getContent(),
                community.getImages().stream()
                        .map(CommunityImage::getImageUrl)
                        .collect(Collectors.toList()),
                community.getMembershipType() != null ? community.getMembershipType().name() : null,
                community.getCreatedAt(),
                community.getUpdatedAt(),
                null
        );

    }

    @Override
    public CommunityDTO saveCommunity(CommunityDTO communityDTO,List<MultipartFile> files) {

        if (communityDTO.getMemberId() == null || communityDTO.getMemberId().isEmpty()) {
            throw new IllegalArgumentException("Member ID is missing.");
        }

        Member member = memberRepository.findByMemberId(communityDTO.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보가 존재하지 않습니다."));

        Community community = new Community();
        community.setPostId(communityDTO.getPostId());
        community.setMember(member);
        community.setPostType(PostType.fromString(communityDTO.getPostType()));
        community.setTitle(communityDTO.getTitle());
        community.setContent(communityDTO.getContent());
        community.setMembershipType(member.getMembershipType());
        community.setCreatedAt(communityDTO.getCreatedAt());

        log.info("멤버쉽:{}",member.getMembershipType().name());

        Community savedCommunity = communityRepository.save(community);

        if(files != null && !files.isEmpty()){
            List<String> savedFileNames = customFileUtil.saveFiles(files);
            List<CommunityImage> images = savedFileNames.stream()
                    .map(fileName -> CommunityImage.builder()
                            .community(savedCommunity)
                            .imageUrl(fileName)
                            .build())
                    .collect(Collectors.toList());
            communityImageRepository.saveAll(images);

        }
        log.info("저장하려는 정보들: {}",savedCommunity);

        return new CommunityDTO(
                savedCommunity.getPostId(),
                savedCommunity.getMember().getMemberId(),
                savedCommunity.getPostType().name(),
                savedCommunity.getTitle(),
                savedCommunity.getContent(),
                savedCommunity.getImages().stream().map(CommunityImage::getImageUrl).collect(Collectors.toList()),
                savedCommunity.getMembershipType().name(),
                savedCommunity.getCreatedAt(),
                savedCommunity.getUpdatedAt(),
                null
        );
    }

    @Override
    public void updateCommunity(CommunityDTO communityDTO, List<MultipartFile> files, List<String> deletedImages) {
        // 데이터베이스에서 ID를 조회해서 기존 데이터를 불러옴
        Community community = communityRepository.findById(communityDTO.getPostId())
                .orElseThrow(() -> new RuntimeException("커뮤니티 글을 찾을 수 없습니다."));

        //  기존 이미지 리스트를 가져오되, null이면 빈 리스트로 설정
        List<String> currentImages = community.getImages() != null ?
                community.getImages().stream().map(CommunityImage::getImageUrl).collect(Collectors.toList())
                : new ArrayList<>();

        log.info(" 해당 게시글의 기존 이미지 리스트: {}", currentImages);

        //  삭제할 이미지 리스트도 null이 아니도록 처리
        deletedImages = deletedImages != null ? deletedImages : new ArrayList<>();
        log.info(" 삭제할 이미지 리스트 (DB & 파일 시스템에서 삭제 예정): {}", deletedImages);

        //  제목, 내용 수정
        community.setTitle(communityDTO.getTitle());
        community.setContent(communityDTO.getContent());
        community.setUpdatedAt(LocalDateTime.now());

        //  삭제할 이미지 처리
        if (!deletedImages.isEmpty()) {
            log.info(" DB에서 삭제할 이미지 개수: {}", deletedImages.size());

            // 1 실제 삭제 전, DB에서 존재하는지 확인
            List<CommunityImage> imagesToDelete = communityImageRepository.findByImageUrlIn(deletedImages);
            log.info(" DB에서 찾은 삭제할 이미지 개수: {}", imagesToDelete.size());

            if (!imagesToDelete.isEmpty()) {
                // 2 DB에서 삭제
                communityImageRepository.deleteByImageUrlIn(deletedImages);
                log.info(" DB에서 삭제 완료 (삭제한 이미지 개수: {})", deletedImages.size());

                // 3 파일 시스템에서도 삭제
                customFileUtil.deleteFiles(deletedImages);
                log.info(" 파일 시스템에서 삭제 완료");
            }
        }

        // ✅ 새로운 이미지 추가
        if (files != null && !files.isEmpty()) {
            List<String> savedFileNames = customFileUtil.saveFiles(files);
            List<CommunityImage> images = savedFileNames.stream()
                    .map(fileName -> CommunityImage.builder()
                            .community(community)
                            .imageUrl(fileName)
                            .build())
                    .collect(Collectors.toList());

            communityImageRepository.saveAll(images);

            currentImages.addAll(savedFileNames);
        }

        log.info("🔹 업데이트 후 최종 이미지 리스트: {}", currentImages);

        // ✅ 다시 저장
        communityRepository.save(community);
    }



    @Override
    public void deleteCommunity(Long postId) {
        //단순 삭제
        Community community = communityRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Community not found."));

        //게시글 삭제
        communityRepository.delete(community);
        log.info("게시글 삭제 완료");
    }

}


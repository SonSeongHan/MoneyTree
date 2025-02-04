package com.moneytree_back.service;

import com.moneytree_back.domain.Community;
import com.moneytree_back.domain.CommunityImage;
import com.moneytree_back.domain.Member;
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
                community.getIsDeleted() ? "삭제된 커뮤니티 글입니다." : community.getTitle(),
                community.getIsDeleted() ? "삭제된 커뮤니티 글입니다." : community.getContent(),
                community.getIsDeleted() ? null : community.getImages().stream()
                        .map(CommunityImage::getImageUrl)
                        .collect(Collectors.toList()),
                community.getMembershipType() != null ? community.getMembershipType().name() : null,
                community.getCreatedAt(),
                community.getUpdatedAt()
        ));
    }

    @Override
    public CommunityDTO getCommunityById(Long postId){

        Community community = communityRepository.findById(postId).orElseThrow(()-> new RuntimeException("해당 커뮤니티 글을 찾을 수 없습니다."));

        return new CommunityDTO(
                community.getPostId(),
                community.getMember() != null ? community.getMember().getMemberId() : null, // Member ID
                community.getPostType().name(),
                community.getIsDeleted() ? "삭제된 커뮤니티 글입니다." : community.getTitle(),
                community.getIsDeleted() ? "삭제된 커뮤니티 글입니다." : community.getContent(),
                community.getIsDeleted() ? null : community.getImages().stream()
                        .map(CommunityImage::getImageUrl)
                        .collect(Collectors.toList()),
                community.getMembershipType() != null ? community.getMembershipType().name() : null,
                community.getCreatedAt(),
                community.getUpdatedAt()
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
                savedCommunity.getUpdatedAt()
        );
    }

    @Override
    public void updateCommunity(CommunityDTO communityDTO,List<MultipartFile> files){
        // 데이터베이스에서 ID를 조회해서 기존 데이터를 불러옴
        Community community = communityRepository.findById(communityDTO.getPostId())
                .orElseThrow(()-> new RuntimeException("커뮤니티 글을 찾을 수 없습니다."));

        //내가 DTO로 캡슐화 되어있는 자료중에서 원하는 것들만 업데이트
        community.setTitle(communityDTO.getTitle());
        community.setContent(communityDTO.getContent());
        community.setUpdatedAt(communityDTO.getUpdatedAt());

        // 이미지 업데이트 (새로운 이미지가 있으면 교체)
        if (files != null && !files.isEmpty()) {
            communityImageRepository.deleteByCommunity(community);

            List<String> savedFileNames = customFileUtil.saveFiles(files);
            List<CommunityImage> images = savedFileNames.stream()
                    .map(fileName -> CommunityImage.builder()
                            .community(community)
                            .imageUrl(fileName)
                            .build())
                    .collect(Collectors.toList());

            communityImageRepository.saveAll(images);
        }
        //다시 저장
        communityRepository.save(community);
    }


    @Override
    public void deleteCommunity(Long postId) {
        //단순 삭제
        Community community=communityRepository.findById(postId)
                .orElseThrow(()->new RuntimeException("Community not found."));

        community.setIsDeleted(true);

        community.setTitle("삭제된 답글입니다.");
        community.setContent("삭제된 답글입니다.");

        communityImageRepository.deleteByCommunity(community);

        communityRepository.save(community);
    }

}


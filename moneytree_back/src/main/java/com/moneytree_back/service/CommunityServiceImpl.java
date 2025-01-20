package com.moneytree_back.service;

import com.moneytree_back.domain.Community;
import com.moneytree_back.domain.MemberType;
import com.moneytree_back.dto.CommunityDTO;
import com.moneytree_back.repository.CommunityRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;
//    private final ModelMapper modelMapper;

    public CommunityServiceImpl(CommunityRepository communityRepository, ModelMapper modelMapper) {
        this.communityRepository = communityRepository;
//        this.modelMapper = modelMapper;
    }

    @Override
    public Page<CommunityDTO> getPagedAllCommunity(Pageable pageable) {

        Page<Community> communityPage = communityRepository.findAll(pageable);

        return communityPage.map(community -> new CommunityDTO(
                community.getId(),
                community.getMemberType() != null ? community.getMemberType().name() : null,
                community.getTitle(),
                community.getContent(),
                community.getImageUrl()
        ));
    }

    @Override
    public CommunityDTO getCommunityById(Long id) {
        Community community = communityRepository.findById(id).orElseThrow(()->new RuntimeException("해당 커뮤니티 글이 없습니다"));
        return new CommunityDTO(
                community.getId(),
                community.getMemberType() != null ? community.getMemberType().name():null,
                community.getTitle(),
                community.getContent(),
                community.getImageUrl()
        );
    }


    @Override
    public void saveCommunity(CommunityDTO communityDTO) {
//        Community community = modelMapper.map(communityDTO, Community.class);
//        Community savedCommunity = communityRepository.save(community);
//        return savedCommunity.getId();

            Community community = new Community();
            community.setTitle(communityDTO.getTitle());
            community.setContent(communityDTO.getContent());
            community.setImageUrl(communityDTO.getImageUrl());
            community.setMemberType(MemberType.valueOf(communityDTO.getMemberType()));
            communityRepository.save(community);
    }

    @Override
    public void updateCommunity(CommunityDTO communityDTO){
        // 데이터베이스에서 ID를 조회해서 기존 데이터를 불러옴
        Community community = communityRepository.findById(communityDTO.getId())
                .orElseThrow(()-> new RuntimeException("커뮤니티 글을 찾을 수 없습니다."));

        //내가 DTO로 캡슐화 되어있는 자료중에서 원하는 것들만 업데이트
        community.setTitle(communityDTO.getTitle());
        community.setContent(communityDTO.getContent());
        community.setImageUrl(communityDTO.getImageUrl());

        //다시 저장
        communityRepository.save(community);
    }


    @Override
    public void deleteCommunity(Long id) {
        //단순 삭제
        communityRepository.deleteById(id);
    }
}


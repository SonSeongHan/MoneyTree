package com.moneytree_back;

import com.moneytree_back.domain.Community;
import com.moneytree_back.dto.CommunityDTO;
import com.moneytree_back.repository.CommunityRepository;
import com.moneytree_back.service.CommunityService;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

import static org.hibernate.loader.internal.AliasConstantsHelper.get;

@Log4j2
@SpringBootTest
public class CommunityServiceTest {

    @Autowired
    private CommunityService communityService;

    @Autowired
    private CommunityRepository communityRepository;

    @Test
    void testSaveCommunity(){

        CommunityDTO communityDTO = new CommunityDTO();
        communityDTO.setTitle("ㅋㅋ");
        communityDTO.setContent("어 애들아 형이야");
        communityDTO.setMembershipType("FullMember");
        communityDTO.setPostType("HOBBY");
        communityDTO.setImageUrl("http://example.com/admin-test.jpg");
        communityDTO.setCreatedAt(LocalDateTime.now());




        communityService.saveCommunity(communityDTO);

        Community savedCommunity = communityRepository.findAll().get(1); //데이터 확인

        log.info("제목:{}",savedCommunity.getTitle());
        log.info("내용:{}",savedCommunity.getContent());
        log.info("이미지:{}",savedCommunity.getImageUrl());
        log.info("회원 유형: {}", savedCommunity.getMembershipType());
        log.info("커뮤니티 종류: {}", savedCommunity.getPostType());

    }

    @Test
    void testUpdateCommunity(){

        Community savedCommunity = communityRepository.findAll().get(1);


        CommunityDTO communityDTO = new CommunityDTO();
        communityDTO.setPostId(savedCommunity.getPostId());
        communityDTO.setTitle("아니 영자햄");
        communityDTO.setContent("저런 간편회원 글 못쓰게 해야죠 ㅅㅂ 뭐함");
        communityDTO.setImageUrl("http://example.com/change-test.jpg");
        communityDTO.setMembershipType("FullMember");
        communityDTO.setUpdatedAt(LocalDateTime.now());

        communityService.updateCommunity(communityDTO);

        Community updatedCommunity = communityRepository.findAll().get(1);

        log.info("수정된 제목: {}", updatedCommunity.getTitle());
        log.info("수정된 내용: {}", updatedCommunity.getContent());
        log.info("수정된 이미지URL: {}", updatedCommunity.getImageUrl());
        log.info("수정된 수정 시간: {}", updatedCommunity.getUpdatedAt());
    }

    @Test
    void testDeleteCommunity(){
        Community savedCommunity = communityRepository.findAll().get(1);
        communityService.deleteCommunity(savedCommunity.getPostId());


    }


}

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
        communityDTO.setTitle("월 1억? ㅋㅋ");
        communityDTO.setContent("님이 월 1억이면 전 하루 10억이요ㅋㅋㅋㅋ구라 ㅗ");
        communityDTO.setMemberType("간편회원");
        communityDTO.setPostType("REAL_ESTATE");
        communityDTO.setImageUrl("http://example.com/admin-test.jpg");
        communityDTO.setCreatedAt(LocalDateTime.now());




        communityService.saveCommunity(communityDTO);

        Community savedCommunity = communityRepository.findAll().get(5); //데이터 확인

        log.info("제목:{}",savedCommunity.getTitle());
        log.info("내용:{}",savedCommunity.getContent());
        log.info("이미지:{}",savedCommunity.getImageUrl());
        log.info("회원 유형: {}", savedCommunity.getMemberType());
        log.info("커뮤니티 종류: {}", savedCommunity.getPostType());

    }

    @Test
    void testUpdateCommunity(){

        Community savedCommunity = communityRepository.findAll().get(0);


        CommunityDTO communityDTO = new CommunityDTO();
        communityDTO.setPostId(savedCommunity.getPostId());
        communityDTO.setTitle("죄송함다");
        communityDTO.setContent("정회원으로 가입할게요");
        communityDTO.setImageUrl("http://example.com/change-test.jpg");
        communityDTO.setMemberType("간편회원");
        communityDTO.setUpdatedAt(LocalDateTime.now());

        communityService.updateCommunity(communityDTO);

        Community updatedCommunity = communityRepository.findAll().get(0);

        log.info("수정된 제목: {}", updatedCommunity.getTitle());
        log.info("수정된 내용: {}", updatedCommunity.getTitle());
        log.info("수정된 이미지URL: {}", updatedCommunity.getTitle());
        log.info("수정된 수정 시간: {}", updatedCommunity.getTitle());
    }

    @Test
    void testDeleteCommunity(){
        Community savedCommunity = communityRepository.findAll().get(0);
        communityService.deleteCommunity(savedCommunity.getPostId());


    }


}

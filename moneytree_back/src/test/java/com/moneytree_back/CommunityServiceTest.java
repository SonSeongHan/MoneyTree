package com.moneytree_back;

import com.moneytree_back.domain.Community;
import com.moneytree_back.dto.CommunityDTO;
import com.moneytree_back.repository.CommunityRepository;
import com.moneytree_back.service.CommunityService;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

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
        communityDTO.setTitle("안녕하심까gg");
        communityDTO.setContent("내용은 없습니다.");
        communityDTO.setMemberType("간편회원");
        communityDTO.setImageUrl("http://example.com/integration-test.jpg");



        communityService.saveCommunity(communityDTO);

        Community savedCommunity = communityRepository.findAll().get(0); // 첫 번째 데이터 확인

        log.info("제목:{}",savedCommunity.getTitle());
        log.info("내용:{}",savedCommunity.getContent());
        log.info("이미지:{}",savedCommunity.getImageUrl());
        log.info("회원 유형: {}", savedCommunity.getMemberType());

    }


}

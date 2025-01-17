package com.moneytree_back.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@Configuration
public class RootConfig {

    @Bean
    public ModelMapper getMapper() {

        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setFieldMatchingEnabled(true) // 필드 매칭 활성화
                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE) // private까지 접근 가능하게 설정
//                .setMatchingStrategy(MatchingStrategies.STRICT); // 이름 값이 무조건 맞는지 확인하게 해주는 것
                .setMatchingStrategy(MatchingStrategies.LOOSE);

        return modelMapper;
    }
}
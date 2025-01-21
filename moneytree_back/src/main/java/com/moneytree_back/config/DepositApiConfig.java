package com.moneytree_back.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix="deposit.api")
@Data
public class DepositApiConfig {

    private String key;
    private String baseUrl;
}

package com.moneytree_back.config.recommendApi;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix="fund.api")
@Data
public class FundApiConfig {
    private String key;
    private String baseUrl;
}
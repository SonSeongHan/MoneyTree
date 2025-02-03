package com.moneytree_back.config.recommendApi;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix="saving.api")
@Data
public class SavingApiConfig {
    private String key;
    private String baseUrl;
}
package com.moneytree_back.config.recommendApi;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "stock.api")
@Data
public class StockApiConfig {
    private String key;
    private String baseUrl;
}
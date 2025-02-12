package com.moneytree_back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class MoneytreeBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoneytreeBackApplication.class, args);
    }

}

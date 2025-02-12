package com.moneytree_back.controller;

import com.moneytree_back.domain.Hobby;
import com.moneytree_back.service.hobby.HobbyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hobbies")
public class HobbyController {

    private final HobbyService hobbyService;

    public HobbyController(HobbyService hobbyService) {
        this.hobbyService = hobbyService;
    }

    // 전체 취미 목록 조회
    @GetMapping
    public List<Hobby> getAllHobbies() {
        return hobbyService.getAllHobbies();
    }

    // 특정 ID의 취미 조회
    @GetMapping("/{id}")
    public Hobby getHobbyById(@PathVariable Long id) {
        return hobbyService.getHobbyById(id);
    }

    // 카테고리별 취미 조회
    @GetMapping("/category/{hobbyCategory}")
    public List<Hobby> getHobbiesByCategory(@PathVariable String hobbyCategory) {
        return hobbyService.getHobbiesByCategory(hobbyCategory);
    }
}

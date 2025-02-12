package com.moneytree_back.service.hobby;

import com.moneytree_back.domain.Hobby;

import java.util.List;

public interface HobbyService {

    List<Hobby> getAllHobbies();
    Hobby getHobbyById(Long id);
    List<Hobby> getHobbiesByCategory(String hobbyCategory);
}

package com.moneytree_back.service;

import com.moneytree_back.domain.Hobby;
import com.moneytree_back.repository.HobbyRepository;
import com.moneytree_back.repository.HobbyRepository;
import com.moneytree_back.service.HobbyService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HobbyServiceImpl implements HobbyService {

    private final HobbyRepository hobbyRepository;

    public HobbyServiceImpl(HobbyRepository hobbyRepository) {
        this.hobbyRepository = hobbyRepository;
    }

    @Override
    public List<Hobby> getAllHobbies() {
        return hobbyRepository.findAll();
    }

    @Override
    public Hobby getHobbyById(Long id) {
        return hobbyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hobby not found with id " + id));
    }

    @Override
    public List<Hobby> getHobbiesByCategory(String hobbyCategory) {
        return hobbyRepository.findByHobbyCategory(hobbyCategory);
    }
}

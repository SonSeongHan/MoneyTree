package com.moneytree_back.repository;

import com.moneytree_back.domain.Hobby;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HobbyRepository extends JpaRepository<Hobby, Long> {
    List<Hobby> findByHobbyCategory(String hobbyCategory);
}

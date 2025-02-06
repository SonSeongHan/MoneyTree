package com.moneytree_back.repository;

import com.moneytree_back.domain.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long> {

  // 단지명검색
  List<Apartment> findByNameContaining(String name);
  // 도로명 검색
  List<Apartment> findByRoadAddressContaining(String roadAddress);
}

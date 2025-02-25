package com.moneytree_back.repository;

import com.moneytree_back.domain.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long> {

  // 단지명 부분 검색 (기존)
  List<Apartment> findByNameContaining(String name);

  // 도로명 부분 검색 (기존)
  List<Apartment> findByRoadAddressContaining(String roadAddress);

  // 단지명 정확한 일치 검색 (추가)
  Optional<Apartment> findByName(String name);

  // ▼ 소유자(Owner) 기준 검색 (예: ownerId가 특정 값인 아파트만 조회)
  List<Apartment> findByOwnerId(String ownerId);
}

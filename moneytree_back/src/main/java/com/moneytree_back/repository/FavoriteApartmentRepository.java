package com.moneytree_back.repository;

import com.moneytree_back.domain.FavoriteApartment;
import com.moneytree_back.domain.member.Member;
import com.moneytree_back.domain.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FavoriteApartmentRepository extends JpaRepository<FavoriteApartment, Long> {

  // 회원과 아파트 관계로 존재 여부 확인
  boolean existsByMemberAndApartment(Member member, Apartment apartment);

  // 회원별 관심 매물 조회
  List<FavoriteApartment> findByMember(Member member);

  // 회원과 아파트 조건으로 관심 매물 삭제
  void deleteByMemberAndApartment(Member member, Apartment apartment);
}

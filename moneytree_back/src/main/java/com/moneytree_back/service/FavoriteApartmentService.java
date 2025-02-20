package com.moneytree_back.service;

import com.moneytree_back.dto.FavoriteApartmentDTO;
import java.util.List;

public interface FavoriteApartmentService {

  // 회원의 관심 매물 추가 (단지명으로 검색) 후 DTO 반환
  FavoriteApartmentDTO addFavoriteApartment(String memberId, String apartmentName);

  // 회원의 관심 매물 삭제 (단지명으로 검색)
  void removeFavoriteApartment(String memberId, String apartmentName);

  // 회원별 관심 매물 목록 조회 (DTO 리스트 반환)
  List<FavoriteApartmentDTO> getFavoriteApartmentsByMember(String memberId);
}

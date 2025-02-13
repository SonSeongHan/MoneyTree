package com.moneytree_back.controller;

import com.moneytree_back.dto.FavoriteApartmentDTO;
import com.moneytree_back.service.FavoriteApartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorite-apartments")
@RequiredArgsConstructor
public class FavoriteApartmentController {

  private final FavoriteApartmentService favoriteApartmentService;

  // 관심 매물 추가: POST /api/favorite-apartments/{apartmentName}
  @PostMapping("/{apartmentName}")
  public ResponseEntity<FavoriteApartmentDTO> addFavoriteApartment(
    @PathVariable String apartmentName,
    @RequestHeader("memberId") String memberId) {
    FavoriteApartmentDTO favoriteDto = favoriteApartmentService.addFavoriteApartment(memberId, apartmentName);
    return ResponseEntity.ok(favoriteDto);
  }

  // 관심 매물 삭제: DELETE /api/favorite-apartments/{apartmentName}
  @DeleteMapping("/{apartmentName}")
  public ResponseEntity<String> removeFavoriteApartment(
    @PathVariable String apartmentName,
    @RequestHeader("memberId") String memberId) {
    favoriteApartmentService.removeFavoriteApartment(memberId, apartmentName);
    return ResponseEntity.ok("관심 매물에서 삭제되었습니다.");
  }

  // 회원별 관심 매물 목록 조회: GET /api/favorite-apartments
  @GetMapping
  public ResponseEntity<List<FavoriteApartmentDTO>> getFavoriteApartments(
    @RequestHeader("memberId") String memberId) {
    List<FavoriteApartmentDTO> favorites = favoriteApartmentService.getFavoriteApartmentsByMember(memberId);
    return ResponseEntity.ok(favorites);
  }
}

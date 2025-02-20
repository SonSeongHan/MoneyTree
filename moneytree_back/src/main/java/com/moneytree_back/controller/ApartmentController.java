package com.moneytree_back.controller;

import com.moneytree_back.domain.Apartment;
import com.moneytree_back.service.ApartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/apartments")
@RequiredArgsConstructor
public class ApartmentController {

  private final ApartmentService apartmentService; // ✅ ApartmentService를 찾을 수 있어야 함

  @GetMapping // 아파트 목록 조회.
  public ResponseEntity<List<Apartment>> getAllApartments() {
    return ResponseEntity.ok(apartmentService.getAllApartments());
  }

  @GetMapping("/name/{name}") // 단지명 검색
  public ResponseEntity<List<Apartment>> getApartmentsByName(@PathVariable String name) {
    return ResponseEntity.ok(apartmentService.getApartmentsByName(name));
  }

  @GetMapping("/{id}") // id명 검색
  public ResponseEntity<Apartment> getApartmentById(@PathVariable Long id) {
    Optional<Apartment> apartment = apartmentService.getApartmentById(id);
    return apartment.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping  // 아파트 새로 저장(생성)
  public ResponseEntity<Apartment> saveApartment(@RequestBody Apartment apartment) {
    return ResponseEntity.ok(apartmentService.saveApartment(apartment));
  }
}

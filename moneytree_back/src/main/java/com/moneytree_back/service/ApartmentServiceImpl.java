package com.moneytree_back.service;

import com.moneytree_back.domain.Apartment;
import com.moneytree_back.repository.ApartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 아파트 정보 서비스 구현 클래스
 * - 실제 비즈니스 로직을 처리하는 클래스
 */
@Service
@RequiredArgsConstructor
public class ApartmentServiceImpl implements ApartmentService {

  private final ApartmentRepository apartmentRepository;

  /**
   * 모든 아파트 목록을 조회
   * @return List<Apartment> 모든 아파트 목록
   */
  @Override
  public List<Apartment> getAllApartments() {
    return apartmentRepository.findAll();
  }

  /**
   * 단지명으로 아파트 검색
   * @param name 검색할 아파트 이름
   * @return List<Apartment> 검색된 아파트 목록
   */
  @Override
  public List<Apartment> getApartmentsByName(String name) {
    return apartmentRepository.findByNameContaining(name);
  }

  /**
   * 주소로 아파트 검색
   * @param keyword 검색 키워드 (도로명 주소)
   * @return List<Apartment> 검색된 아파트 목록
   */
  @Override
  public List<Apartment> searchApartments(String keyword) {
    return apartmentRepository.findByRoadAddressContaining(keyword);
  }

  /**
   * 새로운 아파트 정보를 저장
   * @param apartment 저장할 아파트 객체
   * @return Apartment 저장된 아파트 객체
   */
  @Override
  @Transactional
  public Apartment saveApartment(Apartment apartment) {
    apartment.setCreatedAt(LocalDateTime.now()); // 생성 날짜 자동 설정
    apartment.setUpdatedAt(LocalDateTime.now()); // 업데이트 날짜 자동 설정
    return apartmentRepository.save(apartment);
  }

  /**
   * 특정 아파트 ID로 검색
   * @param id 아파트 ID
   * @return Optional<Apartment> 검색된 아파트 객체
   */
  @Override
  public Optional<Apartment> getApartmentById(Long id) {
    return apartmentRepository.findById(id);
  }
}

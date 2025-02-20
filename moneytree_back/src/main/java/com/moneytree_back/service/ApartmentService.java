package com.moneytree_back.service;

import com.moneytree_back.domain.Apartment;

import java.util.List;
import java.util.Optional;

/**
 * 아파트 정보 서비스 인터페이스
 * - 비즈니스 로직을 정의하며, 구현체(ApartmentServiceImpl)에서 실제 동작을 수행
 */
public interface ApartmentService {

  /**
   * 모든 아파트 목록을 조회
   * @return List<Apartment> 모든 아파트 목록
   */
  List<Apartment> getAllApartments();

  /**
   * 단지명으로 아파트 검색
   * @param name 검색할 아파트 이름
   * @return List<Apartment> 검색된 아파트 목록
   */
  List<Apartment> getApartmentsByName(String name);

  /**
   * 주소로 아파트 검색
   * @param keyword 검색 키워드 (도로명 주소)
   * @return List<Apartment> 검색된 아파트 목록
   */
  List<Apartment> searchApartments(String keyword);

  /**
   * 새로운 아파트 정보를 저장
   * @param apartment 저장할 아파트 객체
   * @return Apartment 저장된 아파트 객체
   */
  Apartment saveApartment(Apartment apartment);

  /**
   * 특정 아파트 ID로 검색
   * @param id 아파트 ID
   * @return Optional<Apartment> 검색된 아파트 객체
   */
  Optional<Apartment> getApartmentById(Long id);
}

package com.moneytree_back.repository;

import com.moneytree_back.domain.ApartmentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApartmentTransactionRepository extends JpaRepository<ApartmentTransaction, Long> {

  // 매수자 아이디로 거래 내역 조회
  List<ApartmentTransaction> findByBuyer_MemberId(String buyerId);

  // 매도자 아이디로 거래 내역 조회
  List<ApartmentTransaction> findBySeller_MemberId(String sellerId);

  // 아파트 이름으로 거래 내역 조회 (Apartment 엔티티의 name 속성 기준)
  List<ApartmentTransaction> findByApartment_Name(String apartmentName);

  // 아파트 이름을 기준으로 최신 거래를 가져오는 메서드
  ApartmentTransaction findTopByApartment_NameOrderByTransactionDateDesc(String apartmentName);

}

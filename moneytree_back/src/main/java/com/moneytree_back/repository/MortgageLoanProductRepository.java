package com.moneytree_back.repository;

import com.moneytree_back.domain.MortgageLoanProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

// 추천 기능을 단순히 빈 리스트를 반환하도록 처리하는 경우
@Repository
public interface MortgageLoanProductRepository extends JpaRepository<MortgageLoanProductEntity, Long> {
  // 필요하다면 실제 조건에 맞게 쿼리 작성
  @Query("SELECT m FROM MortgageLoanProductEntity m")
  List<MortgageLoanProductEntity> findAllProducts();
}

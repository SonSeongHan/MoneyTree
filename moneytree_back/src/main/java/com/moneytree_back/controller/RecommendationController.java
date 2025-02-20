package com.moneytree_back.controller;

import com.moneytree_back.domain.MortgageLoanProductEntity;
import com.moneytree_back.repository.MortgageLoanProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

  private final MortgageLoanProductRepository mortgageLoanProductRepository;

  /**
   * 추천 대출 상품을 반환하는 엔드포인트
   * 현재는 입력된 가격(inputPrice)와 현재 가격(currentPrice)에 관계없이,
   * DB에 저장된 모든 모기지론 상품을 반환하도록 구현하였습니다.
   *
   * 추후 필요에 따라 조건을 추가해서 추천 로직을 구현할 수 있습니다.
   */
  @GetMapping("/price-gap")
  public ResponseEntity<List<MortgageLoanProductEntity>> getRecommendedProducts(
    @RequestParam int currentPrice,
    @RequestParam int inputPrice) {

    // 예를 들어, 단순히 모든 상품을 반환합니다.
    // (조건을 추가하고 싶다면, Repository에 커스텀 메서드를 추가하거나, 여기서 필터링할 수 있습니다.)
    List<MortgageLoanProductEntity> products = mortgageLoanProductRepository.findAll();

    return ResponseEntity.ok(products);
  }
}

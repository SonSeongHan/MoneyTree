package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 아파트 정보를 저장하는 JPA 엔티티 클래스
 */
@Entity
@Table(name = "apartments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Apartment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name; // 아파트 단지명

  @Column(nullable = false)
  private String roadAddress; // 도로명 주소

  private Double area; // 전용 면적 (㎡ 단위)
  private Integer currentPrice; // 현재 가격 (단위: 원)
  private Double changeRate; // 가격 변동률 (%)
  private Double latitude; // 위도 (지도에서 사용)
  private Double longitude; // 경도 (지도에서 사용)

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt; // 데이터 생성 시간 (수정 불가)

  @Column(nullable = false)
  private LocalDateTime updatedAt; // 데이터 업데이트 시간

  /**
   * 연도별 아파트 가격을 저장하는 맵
   * 예: {2022: 50000000, 2023: 52000000}
   */
  @ElementCollection
  @CollectionTable(name = "apartment_prices", joinColumns = @JoinColumn(name = "apartment_id"))
  @MapKeyColumn(name = "year")
  @Column(name = "price")
  private Map<Integer, Integer> prices;

  private String image; // 아파트 이미지 URL
}

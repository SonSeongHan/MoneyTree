package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

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

  @Column(name = "owner_id")   // DB의 owner_id 칼럼
  private String ownerId;

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

  // ===================== 자동 세팅 메서드 =====================

  /** insert 되기 전(createdAt, updatedAt 세팅) */
  @PrePersist
  protected void onCreate() {
    if (this.createdAt == null) {
      this.createdAt = LocalDateTime.now();
    }
    if (this.updatedAt == null) {
      this.updatedAt = LocalDateTime.now();
    }
  }

  /** update 되기 전(updatedAt 갱신) */
  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}


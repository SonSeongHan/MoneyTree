package com.moneytree_back.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteApartmentDTO {
  private Long id;
  private String memberId;
  private Long apartmentId;
  private String apartmentName;
  private Double area;          // 전용 면적 (㎡)
  private Integer currentPrice; // 최신 거래가 (만원 단위)
  private LocalDateTime createdAt;
}

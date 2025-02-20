package com.moneytree_back.domain;

import com.moneytree_back.domain.member.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorite_apartments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteApartment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 회원(Member): 기존 Member 엔티티 사용 (PK 타입: String)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "member_id", nullable = false)
  private Member member;

  // 아파트(Apartment): 기존 Apartment 엔티티 사용
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "apartment_id", nullable = false)
  private Apartment apartment;

  // 아파트 단지명을 별도로 저장 (중복 저장되지만 조회 성능 개선이나 데이터 보존을 위해 유용할 수 있음)
  @Column(name = "apartment_name", nullable = false)
  private String apartmentName;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  // 엔티티 저장 전, apartment 객체가 존재하면 apartmentName 필드를 자동으로 채우도록 함
  @PrePersist
  public void prePersist() {
    if (this.apartment != null && (this.apartmentName == null || this.apartmentName.isEmpty())) {
      this.apartmentName = this.apartment.getName();
    }
  }
}

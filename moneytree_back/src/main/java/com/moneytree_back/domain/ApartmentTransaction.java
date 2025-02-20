package com.moneytree_back.domain;

import com.moneytree_back.domain.member.Member;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "apartment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApartmentTransaction {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "buyer_id", nullable = false)
  private Member buyer;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "seller_id", nullable = false)
  private Member seller;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "apartment_id", nullable = false)
  private Apartment apartment;

  private Integer price;
  private LocalDateTime transactionDate;
  private String remarks;

  // 추가 필드
  private boolean consentGiven;
  private String status;

  // 매도자 인증 관련 필드 추가
  private String sellerSignature;
  private String sellerComments;

  // 거래 요청 시간과 거래 완료 시간 추가
  private LocalDateTime requestTime;  // 거래 요청 시간
  private LocalDateTime completionTime;  // 거래 완료 시간

  // (매수 인증이 필요 없으므로 매수 관련 인증 필드는 생략)
}

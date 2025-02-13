package com.moneytree_back.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApartmentTransactionDTO {
  private Long id;
  private String buyerId;
  private String sellerId;
  private Long apartmentId;
  private String apartmentName;
  private Integer price;
  private LocalDateTime transactionDate;
  private String remarks;
  private boolean consentGiven;
  private String status;
}

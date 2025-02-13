package com.moneytree_back.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApartmentTransactionRequestDTO {
  private String buyerId;
  private String sellerId;
  private String apartmentName;
  private Integer price;
  private String remarks;
}

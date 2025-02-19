// LoanInfoRequest.java
package com.moneytree_back.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoanInfoRequestDTO {
  private Long assets;
  private Long liabilities;
  private Long fixedExpenses;
  private Long fixedIncome;
}

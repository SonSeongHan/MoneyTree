package com.moneytree_back.dto;


import com.moneytree_back.domain.DandwacType;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter

public class DandwacDTO {
    private String dandwAcId;          // 계좌번호
    private String memberId;           // 연관된 Member 엔티티의 PK (member_id)
    private DandwacType accountType;   // 계좌 유형 (기본값: 입출금)
    private BigDecimal balance;        // 잔액
    private String accountPassword;    // 계좌 비밀번호
    private LocalDate createdAt;       // 생성일
}

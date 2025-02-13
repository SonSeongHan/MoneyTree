package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "fund_termination")
public class FundTermination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fund_termination_id", updatable = false, nullable = false)
    private Long fundTerminationId; // 기본 키

    @Column(name = "fund_termination_request_date", nullable = false)
    private LocalDate fundTerminationRequestDate; // 환불 요청 날짜

    @Column(name = "fund_termination_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal fundTerminationAmount; // 요청한 환불 금액

    @Column(name = "fund_termination_status", length = 20)
    private String fundTerminationStatus; // 처리 상태 (대기, 승인, 거절)

    @Column(name = "fund_termination_processed_date")
    private LocalDate fundTerminationProcessedDate; // 환불 처리 완료 날짜

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fund_account_number", nullable = false)
    private FundAccount fundAccount; // 연관된 펀드 계좌
}

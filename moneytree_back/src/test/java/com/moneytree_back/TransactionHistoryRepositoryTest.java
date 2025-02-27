package com.moneytree_back;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.TransactionHistory;
import com.moneytree_back.domain.TransactionHistoryType; // 새 enum 임포트
import com.moneytree_back.repository.DandwacRepository;
import com.moneytree_back.repository.TransactionHistoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@Rollback(false)
public class TransactionHistoryRepositoryTest {

    @Autowired
    private TransactionHistoryRepository transactionHistoryRepository;

    @Autowired
    private DandwacRepository dandwacRepository;

    @Test
    public void testSaveTransactionHistoryForAccount() {
        // 기본키로 계좌번호 "110-2382641-906"를 사용하여 조회합니다.
        Optional<Dandwac> optionalAccount = dandwacRepository.findById("110-2388965-357");
        assertTrue(optionalAccount.isPresent(), "계좌번호 110-2347176-336에 해당하는 계좌를 찾을 수 없습니다.");
        Dandwac account = optionalAccount.get();

        // TransactionHistory 엔티티를 생성합니다.
        // 예시: 식사 비용으로 소비 내역을 기록
        TransactionHistory tx = TransactionHistory.builder()
                .fromAccount(account)  // 소비(출금)의 경우 본인의 계좌를 지정합니다.
                .toAccount(null)       // 소비의 경우 toAccount는 필요하지 않을 수 있습니다.
                .amount(new BigDecimal("5900000"))  // 사용한 금액 예시 (123,456원)
                .transactionHistoryType(TransactionHistoryType.교통) // 거래 유형을 '식사'로 지정
                .createdAt(LocalDateTime.now())
                .depositPurpose("송금") // 소비 목적에 대한 설명
                .fromMemberName(account.getMember().getMemberName()) // 계좌 소유자 이름
                .toMemberName("")  // 소비의 경우 비워둘 수 있습니다.
                .build();

        // DB에 저장합니다.
        TransactionHistory savedTx = transactionHistoryRepository.save(tx);
        assertNotNull(savedTx.getId(), "거래 내역 저장에 실패했습니다.");

        System.out.println("테스트 거래 내역 저장 완료, ID: " + savedTx.getId());
    }
}

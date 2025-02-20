package com.moneytree_back.service.financialProduct;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.financialProduct.StockAccount;
import com.moneytree_back.dto.financialProduct.StockAccountDTO;
import com.moneytree_back.repository.DandwacRepository;
import com.moneytree_back.repository.financialProduct.StockAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
//@Transactional(readOnly = true)
public class StockAccountServiceImpl implements StockAccountService {

    private final StockAccountRepository stockAccountRepository;
    private final DandwacRepository dandwacRepository;

    @Override
    public StockAccountDTO getStockAccountByDandwacId(String dandwAcId) {

//        System.out.println("[DEBUG] 요청된 dandwAcId: " + dandwAcId);
        Dandwac dandwac = dandwacRepository.findById(dandwAcId)
                .orElseThrow(() -> new IllegalArgumentException("입출금 계좌를 찾을 수 없습니다."));

        StockAccount stockAccount = stockAccountRepository.findByDandwAcId(dandwac);
        if (stockAccount == null) {
            throw new IllegalArgumentException("주식 계좌를 찾을 수 없습니다.");
        }
        return convertToDTO(stockAccount);
    }

//    @Override
//    @Transactional
//    public StockAccountDTO createStockAccount(String dandwAcId) {
//        // 1. 입출금 계좌 조회
//        Dandwac dandwac = dandwacRepository.findById(dandwAcId)
//                .orElseThrow(() -> new IllegalArgumentException("입출금 계좌를 찾을 수 없습니다."));
//
//        // 2. 이미 주식 계좌가 있는지 확인
//        if (stockAccountRepository.findByDandwAcId(dandwac) != null) {
//            throw new IllegalArgumentException("이미 주식 계좌가 존재합니다.");
//        }
//
//        // 3. 주식 계좌 생성
//        StockAccount stockAccount = StockAccount.builder()
//                .stockAccountNumber(generateStockAccountNumber())
//                .stockAccountBalance(BigDecimal.ZERO)
//                .stockAccountCreatedAt(LocalDateTime.now())
//                .dandwAcId(dandwac)
//                .build();
//
//        // 4. 저장
//        StockAccount savedAccount = stockAccountRepository.save(stockAccount);
//
//        return convertToDTO(savedAccount);
//    }

    @Override
    @Transactional
    public StockAccountDTO createStockAccount(String memberId) {
        // 1. memberId로 입출금 계좌 조회
        Dandwac dandwac = dandwacRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new IllegalArgumentException("입출금 계좌를 찾을 수 없습니다."));

        // 2. 이미 주식 계좌가 있는지 확인
        if (stockAccountRepository.findByDandwAcId(dandwac) != null) {
            throw new IllegalArgumentException("이미 주식 계좌가 존재합니다.");
        }

        // 3. 주식 계좌 생성
        StockAccount stockAccount = StockAccount.builder()
                .stockAccountNumber(generateStockAccountNumber())
                .stockAccountBalance(BigDecimal.ZERO)
                .stockAccountCreatedAt(LocalDateTime.now())
                .dandwAcId(dandwac)
                .build();

        // 4. 저장
        StockAccount savedAccount = stockAccountRepository.save(stockAccount);

        return convertToDTO(savedAccount);
    }

    @Override
    @Transactional
    public void withdrawToDepositAccount(Long stockAccountNumber, String dandwAcId, BigDecimal amount) {
        // 1. 계좌 조회
        StockAccount stockAccount = stockAccountRepository.findById(stockAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("주식 계좌를 찾을 수 없습니다."));

        Dandwac dandwac = dandwacRepository.findById(dandwAcId)
                .orElseThrow(() -> new IllegalArgumentException("입출금 계좌를 찾을 수 없습니다."));

        // 2. 잔액 검증
        if (stockAccount.getStockAccountBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("잔액이 부족합니다.");
        }

        // 3. 계좌 잔액 업데이트
        stockAccount.setStockAccountBalance(stockAccount.getStockAccountBalance().subtract(amount));
        dandwac.setBalance(dandwac.getBalance().add(amount));

        // 4. 저장
        stockAccountRepository.save(stockAccount);
        dandwacRepository.save(dandwac);
    }

    // 계좌번호 생성 메서드
    private Long generateStockAccountNumber() {
        Random random = new Random();
        long randomNumber;
        do {
            randomNumber = 10000000 + random.nextInt(90000000);
        } while (stockAccountRepository.existsById(randomNumber));
        return randomNumber;
    }

    // DTO 변환 메서드
    private StockAccountDTO convertToDTO(StockAccount stockAccount) {
        return StockAccountDTO.builder()
                .stockAccountNumber(stockAccount.getStockAccountNumber())
                .stockAccountBalance(stockAccount.getStockAccountBalance())
                .stockAccountCreatedAt(stockAccount.getStockAccountCreatedAt())
                .dandwAcId(stockAccount.getDandwAcId().getDandwAcId())
                .build();
    }
}
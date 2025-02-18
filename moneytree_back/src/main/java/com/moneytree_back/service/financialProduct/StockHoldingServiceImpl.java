package com.moneytree_back.service.financialProduct;

import com.moneytree_back.domain.financialProduct.StockAccount;
import com.moneytree_back.domain.financialProduct.StockHolding;
import com.moneytree_back.domain.financialProduct.StockProduct;
import com.moneytree_back.dto.financialProduct.StockHoldingDTO;
import com.moneytree_back.repository.financialProduct.StockAccountRepository;
import com.moneytree_back.repository.financialProduct.StockHoldingRepository;
import com.moneytree_back.repository.financialProduct.StockProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockHoldingServiceImpl implements StockHoldingService {

    private final StockHoldingRepository stockHoldingRepository;
    private final StockAccountRepository stockAccountRepository;
    private final StockProductRepository stockProductRepository;

    @Override
    public List<StockHoldingDTO> getStockHoldingsByAccount(Long stockAccountNumber) {
        StockAccount account = stockAccountRepository.findById(stockAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("주식 계좌를 찾을 수 없습니다."));

        List<StockHolding> holdings = stockHoldingRepository.findByStockAccount(account);
        return holdings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StockHoldingDTO buyStock(Long stockAccountNumber, Long stockProductId, Integer quantity, BigDecimal price) {
        // 1. 계좌와 주식 상품 조회
        StockAccount account = stockAccountRepository.findById(stockAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("주식 계좌를 찾을 수 없습니다."));

        StockProduct product = stockProductRepository.findById(stockProductId)
                .orElseThrow(() -> new IllegalArgumentException("주식 상품을 찾을 수 없습니다."));

        // 2. 총 매수 금액 계산
        BigDecimal totalAmount = price.multiply(BigDecimal.valueOf(quantity));

        // 3. 계좌 잔액 검증
        if (account.getStockAccountBalance().compareTo(totalAmount) < 0) {
            throw new IllegalArgumentException("계좌 잔액이 부족합니다.");
        }

        // 4. 기존 보유 주식 확인
        StockHolding holding = stockHoldingRepository.findByStockAccountAndStockProduct(account, product);

        if (holding == null) {
            // 4-1. 신규 매수
            holding = StockHolding.builder()
                    .stockAccount(account)
                    .stockProduct(product)
                    .stockHoldingQuantity(quantity)
                    .stockHoldingAvgPrice(price)
                    .stockHoldingAcquiredAt(LocalDateTime.now())
                    .build();
        } else {
            // 4-2. 추가 매수 - 평균 매입가 계산
            int totalQuantity = holding.getStockHoldingQuantity() + quantity;
            BigDecimal totalCost = holding.getStockHoldingAvgPrice()
                    .multiply(BigDecimal.valueOf(holding.getStockHoldingQuantity()))
                    .add(price.multiply(BigDecimal.valueOf(quantity)));

            BigDecimal newAvgPrice = totalCost.divide(BigDecimal.valueOf(totalQuantity), 2, BigDecimal.ROUND_HALF_UP);

            holding.setStockHoldingQuantity(totalQuantity);
            holding.setStockHoldingAvgPrice(newAvgPrice);
        }

        // 5. 계좌 잔액 차감
        account.setStockAccountBalance(account.getStockAccountBalance().subtract(totalAmount));

        // 6. 변경사항 저장
        stockAccountRepository.save(account);
        StockHolding savedHolding = stockHoldingRepository.save(holding);

        return convertToDTO(savedHolding);
    }

    @Override
    @Transactional
    public StockHoldingDTO sellStock(Long stockAccountNumber, Long stockProductId, Integer quantity) {
        // 1. 계좌와 주식 상품 조회
        StockAccount account = stockAccountRepository.findById(stockAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("주식 계좌를 찾을 수 없습니다."));

        StockProduct product = stockProductRepository.findById(stockProductId)
                .orElseThrow(() -> new IllegalArgumentException("주식 상품을 찾을 수 없습니다."));

        // 2. 보유 주식 확인
        StockHolding holding = stockHoldingRepository.findByStockAccountAndStockProduct(account, product);

        if (holding == null || holding.getStockHoldingQuantity() < quantity) {
            throw new IllegalArgumentException("매도 가능한 주식 수량이 부족합니다.");
        }

        // 3. 매도 금액 계산
        BigDecimal currentPrice = product.getStockClosingPrice(); // 현재가로 매도 처리
        BigDecimal sellAmount = currentPrice.multiply(BigDecimal.valueOf(quantity));

        // 4. 보유 수량 갱신
        int remainingQuantity = holding.getStockHoldingQuantity() - quantity;

        // 5. 계좌에 매도 금액 추가
        account.setStockAccountBalance(account.getStockAccountBalance().add(sellAmount));

        if (remainingQuantity == 0) {
            // 전량 매도
            stockHoldingRepository.delete(holding);
            return null;
        } else {
            // 부분 매도
            holding.setStockHoldingQuantity(remainingQuantity);
            StockHolding savedHolding = stockHoldingRepository.save(holding);
            return convertToDTO(savedHolding);
        }
    }

    private StockHoldingDTO convertToDTO(StockHolding holding) {
        StockProduct product = holding.getStockProduct();
        return StockHoldingDTO.builder()
                .stockHoldingId(holding.getStockHoldingId())
                .stockAccountNumber(holding.getStockAccount().getStockAccountNumber())
                .stockProductId(product.getStockProductId())
                .stockProductName(product.getStockProductName())
                .stockHoldingQuantity(holding.getStockHoldingQuantity())
                .stockHoldingAvgPrice(holding.getStockHoldingAvgPrice())
                .stockHoldingAcquiredAt(holding.getStockHoldingAcquiredAt())
                .stockClosingPrice(product.getStockClosingPrice())       // 현재가 추가
                .stockFluctuationRate(product.getStockFluctuationRate()) // 등락률 추가
                .build();
    }
}
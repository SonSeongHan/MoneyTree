package com.moneytree_back.service.financialProduct;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.financialProduct.FundAccount;
import com.moneytree_back.domain.financialProduct.FundProduct;
import com.moneytree_back.dto.financialProduct.FundAccountDTO;
import com.moneytree_back.dto.financialProduct.FundProductDTO;
import com.moneytree_back.repository.DandwacRepository;
import com.moneytree_back.repository.financialProduct.FundAccountRepository;
import com.moneytree_back.repository.financialProduct.FundProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FundAccountServiceImpl implements FundAccountService {

    private final FundAccountRepository fundAccountRepository;
    private final FundProductRepository fundProductRepository;
    private final DandwacRepository dandwacRepository;

    @Override
    public List<FundAccountDTO> getFundAccountsByDandwacId(String dandwAcId) {
        Dandwac dandwac = dandwacRepository.findById(dandwAcId)
                .orElseThrow(() -> new IllegalArgumentException("입출금 계좌를 찾을 수 없습니다."));

        List<FundAccount> fundAccounts = fundAccountRepository.findAllByDandwAcId(dandwac);

        return fundAccounts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FundAccountDTO createFundAccount(String dandwAcId) {
        // 1. 입출금 계좌 조회
        Dandwac dandwac = dandwacRepository.findById(dandwAcId)
                .orElseThrow(() -> new IllegalArgumentException("입출금 계좌를 찾을 수 없습니다."));

        // 2. 이미 펀드 계좌가 있는지 확인
       List<FundAccount> existingAccounts = fundAccountRepository.findAllByDandwAcId(dandwac);

        // 3. 펀드 계좌 생성
        FundAccount fundAccount = FundAccount.builder()
                .fundAccountNumber(generateFundAccountNumber())
                .fundInvestmentAmount(BigDecimal.ZERO)
                .fundInvestmentDate(null)
                .fundMaturityDate(null)
                .fundExpectedReturn(BigDecimal.ZERO)
                .fundStatus("신규")
                .dandwAcId(dandwac)
                .build();

        // 4. 저장
        FundAccount savedAccount = fundAccountRepository.save(fundAccount);

        return convertToDTO(savedAccount);
    }

    @Override
    @Transactional
    public FundAccountDTO investInFund(String dandwAcId, Long fundProductId, BigDecimal investmentAmount) {

        // 입출금 계좌 조회 및 잔액 확인
        Dandwac dandwac = dandwacRepository.findById(dandwAcId)
                .orElseThrow(() -> new IllegalArgumentException("입출금 계좌를 찾을 수 없습니다."));

        // 잔액 부족 시 예외 처리
        if (dandwac.getBalance().compareTo(investmentAmount) < 0) {
            throw new IllegalArgumentException("입출금 계좌 잔액이 부족합니다.");
        }

        // 펀드 상품 조회
        FundProduct product = fundProductRepository.findById(fundProductId)
                .orElseThrow(() -> new IllegalArgumentException("펀드 상품을 찾을 수 없습니다."));

        // 입출금 계좌에서 투자금액 차감
        dandwac.setBalance(dandwac.getBalance().subtract(investmentAmount));
        dandwacRepository.save(dandwac);

        // 펀드 계좌 생성
        FundAccount account = FundAccount.builder()
                .fundAccountNumber(generateFundAccountNumber())
                .fundProductId(product)
                .fundInvestmentAmount(investmentAmount)
                .fundInvestmentDate(LocalDate.now())
                .fundMaturityDate(product.getFundProductExpiration())
                .fundStatus("운용중")
                .dandwAcId(dandwac)
                .build();

        // 예상 수익률 설정
        Random random = new Random();
        BigDecimal expectedReturn = BigDecimal.valueOf(5 + random.nextInt(11))
                .subtract(product.getFundProductManagementFee());
        account.setFundExpectedReturn(expectedReturn);

        // 저장 및 DTO 반환
        FundAccount savedAccount = fundAccountRepository.save(account);
        return convertToDTO(savedAccount);
    }

    @Override
    public boolean checkRedemptionEligibility(Long fundAccountNumber) {
        FundAccount account = fundAccountRepository.findById(fundAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("펀드 계좌를 찾을 수 없습니다."));

        if (!"운용중".equals(account.getFundStatus())) {
            return false;
        }

        // 투자 시작일부터 현재까지의 기간이 만기의 50% 이상인지 확인
        LocalDate now = LocalDate.now();
        long totalDuration = ChronoUnit.DAYS.between(account.getFundInvestmentDate(), account.getFundMaturityDate());
        long elapsedDuration = ChronoUnit.DAYS.between(account.getFundInvestmentDate(), now);

        return elapsedDuration >= (totalDuration / 2);
    }

    @Override
    @Transactional
    public FundAccountDTO redeemFund(Long fundAccountNumber, BigDecimal amount) {
        // 1. 계좌 조회 및 환매 가능 여부 확인
        if (!checkRedemptionEligibility(fundAccountNumber)) {
            throw new IllegalArgumentException("현재 환매가 불가능한 상태입니다.");
        }

        FundAccount account = fundAccountRepository.findById(fundAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("펀드 계좌를 찾을 수 없습니다."));

        // 2. 환매 수수료 계산 및 차감
        BigDecimal redemptionFee = amount.multiply(account.getFundProductId().getFundProductRedemptionFee())
                .divide(BigDecimal.valueOf(100));
        BigDecimal actualAmount = amount.subtract(redemptionFee);

        // 3. 입출금 계좌로 환매 금액 이체
        Dandwac dandwac = account.getDandwAcId();
        dandwac.setBalance(dandwac.getBalance().add(actualAmount));
        dandwacRepository.save(dandwac);

        // 4. 계좌 정보 업데이트
        account.setFundInvestmentAmount(account.getFundInvestmentAmount().subtract(amount));
        if (account.getFundInvestmentAmount().compareTo(BigDecimal.ZERO) == 0) {
            account.setFundStatus("해지됨");
        }

        // 5. 저장
        FundAccount savedAccount = fundAccountRepository.save(account);
        return convertToDTO(savedAccount);
    }

    @Override
    public List<FundProductDTO> getAvailableFundProducts(
            BigDecimal minTotalAmount,
            BigDecimal maxTotalAmount,
            BigDecimal maxManagementFee,
            BigDecimal maxRedemptionFee,
            LocalDate minMaturityDate) {
        return fundProductRepository.findFilteredFundProducts(
                        minTotalAmount,
                        maxTotalAmount,
                        maxManagementFee,
                        maxRedemptionFee,
                        minMaturityDate
                ).stream()
                .map(this::convertToProductDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BigDecimal calculateExpectedProfit(Long fundAccountNumber) {
        FundAccount account = fundAccountRepository.findById(fundAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("펀드 계좌를 찾을 수 없습니다."));

        return account.getFundInvestmentAmount()
                .multiply(account.getFundExpectedReturn())
                .divide(BigDecimal.valueOf(100));
    }

    @Override
    public BigDecimal calculateRedemptionAmount(Long fundAccountNumber, BigDecimal amount) {
        FundAccount account = fundAccountRepository.findById(fundAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("펀드 계좌를 찾을 수 없습니다."));

        BigDecimal redemptionFee = amount.multiply(account.getFundProductId().getFundProductRedemptionFee())
                .divide(BigDecimal.valueOf(100));

        return amount.subtract(redemptionFee);
    }

    @Override
    public String getFundStatus(Long fundAccountNumber) {
        FundAccount account = fundAccountRepository.findById(fundAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("펀드 계좌를 찾을 수 없습니다."));

        return account.getFundStatus();
    }

    @Override
    public Long getRemainingDays(Long fundAccountNumber) {
        FundAccount account = fundAccountRepository.findById(fundAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("펀드 계좌를 찾을 수 없습니다."));

        if (account.getFundMaturityDate() == null) {
            return 0L;
        }

        return ChronoUnit.DAYS.between(LocalDate.now(), account.getFundMaturityDate());
    }

    // 계좌번호 생성 메서드
    private Long generateFundAccountNumber() {
        Random random = new Random();
        long randomNumber;
        do {
            // 10000000 ~ 99999999 사이의 랜덤한 8자리 숫자 생성
            randomNumber = 10000000 + random.nextInt(90000000);
        } while (fundAccountRepository.existsById(randomNumber));
        return randomNumber;
    }

    // DTO 변환 메서드
    private FundAccountDTO convertToDTO(FundAccount fundAccount) {
        return FundAccountDTO.builder()
                .fundAccountNumber(fundAccount.getFundAccountNumber())
                .fundInvestmentAmount(fundAccount.getFundInvestmentAmount())
                .fundInvestmentDate(fundAccount.getFundInvestmentDate())
                .fundMaturityDate(fundAccount.getFundMaturityDate())
                .fundExpectedReturn(fundAccount.getFundExpectedReturn())
                .fundStatus(fundAccount.getFundStatus())
                .fundProductId(fundAccount.getFundProductId() != null ?
                        fundAccount.getFundProductId().getFundProductId() : null)
                .dandwAcId(fundAccount.getDandwAcId().getDandwAcId())
                .fundProductName(fundAccount.getFundProductId() != null ?
                        fundAccount.getFundProductId().getFundProductName() : null)
                .fundProductType(fundAccount.getFundProductId() != null ?
                        fundAccount.getFundProductId().getFundProductType() : null)
                .build();
    }

    private FundProductDTO convertToProductDTO(FundProduct product) {
        return FundProductDTO.builder()
                .fundProductId(product.getFundProductId())
                .fundProductYear(product.getFundProductYear())
                .fundProductType(product.getFundProductType())
                .fundProductManager(product.getFundProductManager())
                .fundProductName(product.getFundProductName())
                .fundProductExpiration(product.getFundProductExpiration())
                .fundProductTotalAmount(product.getFundProductTotalAmount())
                .fundProductManagementFee(product.getFundProductManagementFee())
                .fundProductRedemptionFee(product.getFundProductRedemptionFee())
                .build();
    }
}
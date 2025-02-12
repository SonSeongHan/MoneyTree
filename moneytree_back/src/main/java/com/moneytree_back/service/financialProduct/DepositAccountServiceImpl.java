package com.moneytree_back.service.financialProduct;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.financialProduct.DepositAccount;
import com.moneytree_back.domain.financialProduct.DepositProduct;
import com.moneytree_back.dto.financialProduct.DepositAccountDTO;
import com.moneytree_back.repository.DandwacRepository;
import com.moneytree_back.repository.financialProduct.DepositAccountRepository;
import com.moneytree_back.repository.financialProduct.DepositProductRepository;
import com.moneytree_back.service.DandwacService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DepositAccountServiceImpl implements DepositAccountService {

    private final DepositAccountRepository depositAccountRepository;
    private final DepositProductRepository depositProductRepository;
    private final DandwacRepository dandwacRepository;
    private final DandwacService dandwacService;

    private Long generateRandomAccountNumber() {
        Random random = new Random();
        // 8자리 랜덤 숫자 생성 (10000000 ~ 99999999)
        long randomNumber;
        do {
            randomNumber = 10000000 + random.nextInt(90000000);
        } while (depositAccountRepository.existsById(randomNumber)); // 중복 체크
        return randomNumber;
    }

    @Override
    public DepositAccountDTO createDepositAccount(DepositAccountDTO depositAccountDTO) {

        // 입출금 계좌 잔액 확인
        Dandwac dandwac = dandwacRepository.findById(depositAccountDTO.getDandwAcId())
                .orElseThrow(() -> new RuntimeException("입출금 계좌를 찾을 수 없습니다."));

        // 예금 상품 정보 조회
        DepositProduct depositProduct = depositProductRepository.findById(depositAccountDTO.getDepositProductId())
                .orElseThrow(() -> new RuntimeException("예금 상품을 찾을 수 없습니다."));

        // 최소 가입금액 확인
        if (depositAccountDTO.getDepositAmount().compareTo(depositProduct.getDepositMinAmount()) < 0) {
            throw new RuntimeException("최소 가입금액보다 작은 금액입니다.");
        }

        // 잔액 충분한지 확인
        if (dandwac.getBalance().compareTo(depositAccountDTO.getDepositAmount()) < 0) {
            throw new RuntimeException("잔액이 부족합니다.");
        }

        // 입출금 계좌에서 금액 차감
        dandwac.setBalance(dandwac.getBalance().subtract(depositAccountDTO.getDepositAmount()));
        dandwacRepository.save(dandwac);

        // 예금 상품의 만기 기간을 가져와서 적용
        Integer maturityPeriod = depositProduct.getDepositMaturityPeriod();
        if (maturityPeriod == null || maturityPeriod <= 0) {
            throw new RuntimeException("유효하지 않은 만기 기간입니다.");
        }

        // 예금 계좌 생성
        DepositAccount depositAccount = DepositAccount.builder()
                .depositAccountNumber(generateRandomAccountNumber())  // 랜덤 계좌번호 생성
                .depositAmount(depositAccountDTO.getDepositAmount())
                .depositStartDate(LocalDate.now())
                .depositEndDate(LocalDate.now().plusMonths(maturityPeriod))
                .depositAccountCreatedAt(LocalDateTime.now())
                .depositProductId(depositProduct)
                .dandwAcId(dandwac)
                .isRegularPayment(depositAccountDTO.getIsRegularPayment())
                .regularPaymentAmount(depositAccountDTO.getRegularPaymentAmount())
                .regularPaymentDay(depositAccountDTO.getRegularPaymentDay())
                .lastPaymentDate(null)
                .build();

        if (depositAccount.getDepositAmount() == null ||
                depositAccount.getDepositStartDate() == null ||
                depositAccount.getDepositEndDate() == null ||
                depositAccount.getDepositProductId() == null ||
                depositAccount.getDandwAcId() == null) {
            throw new RuntimeException("필수 필드가 누락되었습니다.");
        }

        try {
            DepositAccount savedAccount = depositAccountRepository.save(depositAccount);
            return convertToDTO(savedAccount);
        } catch (Exception e) {
            throw new RuntimeException("예금 계좌 생성 중 오류 발생: " + e.getMessage());
        }
    }

    @Override
    public List<DepositAccountDTO> getDepositAccountsByDandwAcId(Dandwac dandwAcId) {
        return depositAccountRepository.findByDandwAcId(dandwAcId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private BigDecimal calculatePenaltyFee(DepositAccount account) {
        // 원금의 1~5% 사이의 랜덤 위약금 계산
        double randomRate = 0.01 + Math.random() * 0.04; // 1~5% 사이의 랜덤 비율
        return account.getDepositAmount().multiply(BigDecimal.valueOf(randomRate))
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional
    public void terminateDepositAccount(Long depositAccountNumber, String terminationReason, BigDecimal penaltyFee) {
        DepositAccount depositAccount = depositAccountRepository.findById(depositAccountNumber)
                .orElseThrow(() -> new RuntimeException("예금 계좌를 찾을 수 없습니다."));

        // 이자 계산
        BigDecimal interest = calculateDepositInterest(depositAccountNumber);

        // 중도해지 위약금 적용
        if (!depositAccount.getDepositEndDate().isEqual(LocalDate.now())) {
            // 중도해지 시 위약금 계산 및 적용
            BigDecimal calculatedPenaltyFee = calculatePenaltyFee(depositAccount);
            interest = interest.subtract(calculatedPenaltyFee);
        }

        // 원금 + 이자를 입출금 계좌로 이체
        Dandwac dandwac = depositAccount.getDandwAcId();
        BigDecimal totalAmount = depositAccount.getDepositAmount().add(interest);
        dandwac.setBalance(dandwac.getBalance().add(totalAmount));
        dandwacRepository.save(dandwac);

        // 예금 계좌 삭제
        depositAccountRepository.delete(depositAccount);
    }

    @Transactional
    public void setRegularPayment(Long depositAccountNumber, BigDecimal regularAmount, Integer paymentDay) {
        if (paymentDay < 1 || paymentDay > 28) {
            throw new IllegalArgumentException("납입일은 1일에서 28일 사이여야 합니다.");
        }

        DepositAccount account = depositAccountRepository.findById(depositAccountNumber)
                .orElseThrow(() -> new RuntimeException("예금 계좌를 찾을 수 없습니다."));

        account.setRegularPaymentAmount(regularAmount);
        account.setRegularPaymentDay(paymentDay);
        account.setIsRegularPayment(true);

        depositAccountRepository.save(account);
    }

    @Transactional
    public void cancelRegularPayment(Long depositAccountNumber) {
        DepositAccount account = depositAccountRepository.findById(depositAccountNumber)
                .orElseThrow(() -> new RuntimeException("예금 계좌를 찾을 수 없습니다."));

        account.setIsRegularPayment(false);
        account.setRegularPaymentAmount(null);
        account.setRegularPaymentDay(null);

        depositAccountRepository.save(account);
    }

    @Override
    public BigDecimal calculateDepositInterest(Long depositAccountNumber) {
        DepositAccount account = depositAccountRepository.findById(depositAccountNumber)
                .orElseThrow(() -> new RuntimeException("예금 계좌를 찾을 수 없습니다."));

        DepositProduct product = account.getDepositProductId();
        long months = ChronoUnit.MONTHS.between(account.getDepositStartDate(), LocalDate.now());

        // 기본 이자율과 우대 이자율을 합산
        BigDecimal baseRate = product.getDepositBaseInterestRate();
        BigDecimal primeRate = product.getDepositPrimeInterestRate();

        if (baseRate == null || primeRate == null) {
            throw new RuntimeException("이자율 정보가 올바르지 않습니다.");
        }

        BigDecimal interestRate = baseRate.add(primeRate)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

        String interestRateType = product.getDepositInterestRateType();
        if (interestRateType == null) {
            throw new RuntimeException("이자율 유형이 지정되지 않았습니다.");
        }

        if ("단리".equals(interestRateType)) {
            // 단리 계산: 원금 * 이율 * 기간(연)
            return account.getDepositAmount()
                    .multiply(interestRate)
                    .multiply(BigDecimal.valueOf(months))
                    .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        } else {
            // 복리 계산: 원금 * (1 + 이율)^기간(연) - 원금
            return account.getDepositAmount()
                    .multiply(BigDecimal.ONE.add(interestRate).pow((int) months / 12))
                    .subtract(account.getDepositAmount())
                    .setScale(2, RoundingMode.HALF_UP);
        }
    }

    @Override
    @Scheduled(cron = "0 0 0 * * *") // 매일 자정에 실행
    public void processDepositMaturity() {
        List<DepositAccount> maturedAccounts = depositAccountRepository.findAll().stream()
                .filter(account -> account.getDepositEndDate().isEqual(LocalDate.now()))
                .collect(Collectors.toList());

        for (DepositAccount account : maturedAccounts) {
            terminateDepositAccount(account.getDepositAccountNumber(), "만기", BigDecimal.ZERO);
        }
    }

    @Override
    @Scheduled(cron = "0 0 3 * * *") // 매일 새벽 3시에 실행
    public void scheduleDepositPayments() {
        LocalDate today = LocalDate.now();

        // 정기 납입이 설정된 모든 계좌 조회
        List<DepositAccount> regularAccounts = depositAccountRepository.findAll().stream()
                .filter(account -> account.getIsRegularPayment() != null && account.getIsRegularPayment())
                .filter(account -> {
                    // 계좌 생성일의 일자와 오늘 일자가 같은지 확인
                    return account.getDepositAccountCreatedAt().getDayOfMonth() == today.getDayOfMonth();
                })
                .collect(Collectors.toList());

        for (DepositAccount account : regularAccounts) {
            processRegularPayment(account, today);
        }
    }

    private void processRegularPayment(DepositAccount account, LocalDate today) {
        try {
            // 마지막 납입일 확인
            LocalDate lastPayment = account.getLastPaymentDate();
            if (lastPayment != null && lastPayment.getMonth() == today.getMonth()
                    && lastPayment.getYear() == today.getYear()) {
                return; // 이번 달 이미 납입됨
            }

            // 입출금 계좌 잔액 확인
            Dandwac dandwac = account.getDandwAcId();
            BigDecimal regularAmount = account.getRegularPaymentAmount();

            if (dandwac.getBalance().compareTo(regularAmount) < 0) {
                // 잔액 부족 시 처리 (알림 발송 등)
                return;
            }

            // 입출금 계좌에서 금액 차감
            dandwac.setBalance(dandwac.getBalance().subtract(regularAmount));
            dandwacRepository.save(dandwac);

            // 예금 금액 증가
            account.setDepositAmount(account.getDepositAmount().add(regularAmount));
            account.setLastPaymentDate(today);
            depositAccountRepository.save(account);

        } catch (Exception e) {
            // 에러 로깅 및 처리
            throw new RuntimeException("정기 납입 처리 중 오류 발생: " + e.getMessage());
        }
    }

    private DepositAccountDTO convertToDTO(DepositAccount depositAccount) {
        return DepositAccountDTO.builder()
                .depositAccountNumber(depositAccount.getDepositAccountNumber())
                .depositAmount(depositAccount.getDepositAmount())
                .depositStartDate(depositAccount.getDepositStartDate())
                .depositEndDate(depositAccount.getDepositEndDate())
                .depositProductId(depositAccount.getDepositProductId().getDepositProductId())
                .dandwAcId(depositAccount.getDandwAcId().getDandwAcId())
                .formattedAccountNumber(String.format("320-%04d-%04d",
                        depositAccount.getDepositAccountNumber() / 10000,
                        depositAccount.getDepositAccountNumber() % 10000))
                .build();
    }
}

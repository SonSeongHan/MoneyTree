package com.moneytree_back.service.financialProduct;

import com.moneytree_back.domain.*;
import com.moneytree_back.domain.financialProduct.SavingAccount;
import com.moneytree_back.domain.financialProduct.SavingAccountStatus;
import com.moneytree_back.domain.financialProduct.SavingProduct;
import com.moneytree_back.domain.financialProduct.SavingTermination;
import com.moneytree_back.dto.financialProduct.SavingAccountDTO;
import com.moneytree_back.repository.DandwacRepository;
import com.moneytree_back.repository.financialProduct.SavingAccountRepository;
import com.moneytree_back.repository.financialProduct.SavingProductRepository;
import com.moneytree_back.repository.financialProduct.SavingTerminationRepository;
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
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SavingAccountServiceImpl implements SavingAccountService {

    private final SavingAccountRepository savingAccountRepository;
    private final SavingProductRepository savingProductRepository;
    private final DandwacRepository dandwacRepository;
    private final SavingTerminationRepository savingTerminationRepository;

    private Long generateRandomAccountNumber() {
        Random random = new Random();
        long randomNumber;
        do {
            randomNumber = 10000000 + random.nextInt(90000000);
        } while (savingAccountRepository.existsById(randomNumber));
        return randomNumber;
    }

    @Override
    public SavingAccountDTO createSavingAccount(SavingAccountDTO savingAccountDTO) {
        // 입출금 계좌 조회
        Dandwac dandwac = dandwacRepository.findById(savingAccountDTO.getDandwAcId())
                .orElseThrow(() -> new RuntimeException("입출금 계좌를 찾을 수 없습니다."));

        // 적금 상품 정보 조회
        SavingProduct savingProduct = savingProductRepository.findById(savingAccountDTO.getSavingProductId())
                .orElseThrow(() -> new RuntimeException("적금 상품을 찾을 수 없습니다."));

        // 최소/최대 가입금액 확인
        if (savingAccountDTO.getSavingDepositAmount().compareTo(savingProduct.getSavingMinAmount()) < 0) {
            throw new RuntimeException("최소 가입금액보다 작은 금액입니다.");
        }
        if (savingAccountDTO.getSavingDepositAmount().compareTo(savingProduct.getSavingMaxAmount()) > 0) {
            throw new RuntimeException("최대 가입금액을 초과하였습니다.");
        }

        // 잔액 충분한지 확인
        if (dandwac.getBalance().compareTo(savingAccountDTO.getSavingDepositAmount()) < 0) {
            throw new RuntimeException("잔액이 부족합니다.");
        }

        // 입출금 계좌에서 첫 납입금 차감
        dandwac.setBalance(dandwac.getBalance().subtract(savingAccountDTO.getSavingDepositAmount()));
        dandwacRepository.save(dandwac);

        // 적금 만기 기간 설정
        Integer maturityPeriod = savingProduct.getSavingMaturityPeriod();
        if (maturityPeriod == null || maturityPeriod <= 0) {
            throw new RuntimeException("유효하지 않은 만기 기간입니다.");
        }

        // 적금 계좌 생성
        SavingAccount savingAccount = SavingAccount.builder()
                .savingAccountNumber(generateRandomAccountNumber())
                .savingDepositAmount(savingAccountDTO.getSavingDepositAmount())
                .savingStartDate(LocalDate.now())
                .savingEndDate(LocalDate.now().plusMonths(maturityPeriod))
                .savingAccountCreatedAt(LocalDateTime.now())
                .savingProductId(savingProduct)
                .dandwAcId(dandwac)
                .savingRegularPaymentAmount(savingAccountDTO.getSavingDepositAmount()) // 정기납입금액은 첫 납입금액과 동일
                .savingRegularPaymentDay(savingAccountDTO.getSavingRegularPaymentDay())
                .isSavingRegularPayment(true) // 항상 true
                .lastSavingPaymentDate(LocalDate.now())
                .savingAccountStatus(SavingAccountStatus.SAVING_ACCOUNT_ACTIVE)
                .build();

        try {
            SavingAccount savedAccount = savingAccountRepository.save(savingAccount);
            return convertToDTO(savedAccount);
        } catch (Exception e) {
            throw new RuntimeException("적금 계좌 생성 중 오류 발생: " + e.getMessage());
        }
    }

    @Override
    public void setRegularPayment(Long savingAccountNumber, BigDecimal regularAmount, Integer paymentDay) {
        throw new RuntimeException("적금은 정기납입 금액을 변경할 수 없습니다. 첫 납입금액으로 고정됩니다.");
    }

    @Override
    public void cancelRegularPayment(Long savingAccountNumber) {
        throw new RuntimeException("적금은 정기납입을 취소할 수 없습니다.");
    }

    @Override
    public List<SavingAccountDTO> getSavingAccountsByDandwAcId(Dandwac dandwAcId) {
        return savingAccountRepository.findByDandwAcIdAndSavingAccountStatus(
                        dandwAcId,
                        SavingAccountStatus.SAVING_ACCOUNT_ACTIVE
                ).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void terminateSavingAccount(Long savingAccountNumber, String terminationReason) {
        SavingAccount savingAccount = savingAccountRepository.findById(savingAccountNumber)
                .orElseThrow(() -> new RuntimeException("적금 계좌를 찾을 수 없습니다."));

        // 이자 계산
        BigDecimal interest = calculateSavingInterest(savingAccountNumber);

        // 기본 위약금 0으로 설정
        BigDecimal savingPenaltyFee = BigDecimal.ZERO;

        // 중도 해지라면 위약금 적용 (1.5% ~ 3%)
        if (!terminationReason.equals("만기")) {
            double randomRate = 0.015 + new Random().nextDouble() * 0.015;
            savingPenaltyFee = savingAccount.getSavingDepositAmount().multiply(BigDecimal.valueOf(randomRate))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        // 서비스 수수료 0.5% (예금보다 낮게 설정)
        BigDecimal savingServiceFee = savingAccount.getSavingDepositAmount().multiply(BigDecimal.valueOf(0.005))
                .setScale(2, RoundingMode.HALF_UP);

        // 총 환급 금액 계산
        BigDecimal totalRefundAmount = savingAccount.getSavingDepositAmount().add(interest)
                .subtract(savingPenaltyFee).subtract(savingServiceFee)
                .setScale(2, RoundingMode.HALF_UP);

        if (totalRefundAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalRefundAmount = BigDecimal.ZERO;
        }

        // 원금 + 이자 - 위약금 - 수수료를 입출금 계좌에 반환
        Dandwac dandwac = savingAccount.getDandwAcId();
        dandwac.setBalance(dandwac.getBalance().add(totalRefundAmount));
        dandwacRepository.save(dandwac);

        // 해지 내역 저장
        SavingTermination savingTermination = SavingTermination.builder()
                .savingTerminationDate(LocalDateTime.now())
                .savingTerminationReason(terminationReason)
                .savingPenaltyFee(savingPenaltyFee)
                .savingServiceFee(savingServiceFee)
                .savingRefundAmount(totalRefundAmount)
                .savingAccount(savingAccount)
                .build();

        savingTerminationRepository.save(savingTermination);

        // 상태 변경
        savingAccount.setSavingAccountStatus(SavingAccountStatus.SAVING_ACCOUNT_TERMINATED);
        savingAccountRepository.save(savingAccount);
    }

    @Override
    public BigDecimal calculateSavingInterest(Long savingAccountNumber) {
        SavingAccount account = savingAccountRepository.findById(savingAccountNumber)
                .orElseThrow(() -> new RuntimeException("적금 계좌를 찾을 수 없습니다."));

        SavingProduct product = account.getSavingProductId();
        long months = ChronoUnit.MONTHS.between(account.getSavingStartDate(), LocalDate.now());

        BigDecimal baseRate = product.getSavingBaseInterestRate();
        BigDecimal primeRate = product.getSavingPrimeInterestRate();
        BigDecimal totalRate = baseRate.add(primeRate).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

        if ("단리".equals(product.getSavingInterestRateType())) {
            return account.getSavingDepositAmount()
                    .multiply(totalRate)
                    .multiply(BigDecimal.valueOf(months))
                    .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        } else {
            return account.getSavingDepositAmount()
                    .multiply(BigDecimal.ONE.add(totalRate).pow((int) months / 12))
                    .subtract(account.getSavingDepositAmount())
                    .setScale(2, RoundingMode.HALF_UP);
        }
    }

    @Override
    @Scheduled(cron = "0 0 0 * * *") // 매일 자정에 실행
    public void processSavingMaturity() {
        List<SavingAccount> maturedAccounts = savingAccountRepository.findAll().stream()
                .filter(account -> account.getSavingEndDate().isEqual(LocalDate.now()))
                .collect(Collectors.toList());

        for (SavingAccount account : maturedAccounts) {
            terminateSavingAccount(account.getSavingAccountNumber(), "만기");
        }
    }

    @Override
    @Scheduled(cron = "0 0 3 * * *") // 매일 새벽 3시에 실행
    public void scheduleSavingPayments() {
        LocalDate today = LocalDate.now();

        List<SavingAccount> activeAccounts = savingAccountRepository.findAll().stream()
                .filter(account -> account.getSavingAccountStatus() == SavingAccountStatus.SAVING_ACCOUNT_ACTIVE)
                .filter(account -> account.getSavingRegularPaymentDay() == today.getDayOfMonth())
                .collect(Collectors.toList());

        for (SavingAccount account : activeAccounts) {
            processRegularPayment(account, today);
        }
    }

    private void processRegularPayment(SavingAccount account, LocalDate today) {
        try {
            LocalDate lastPayment = account.getLastSavingPaymentDate();
            if (lastPayment != null && lastPayment.getMonth() == today.getMonth()
                    && lastPayment.getYear() == today.getYear()) {
                return; // 이번 달 이미 납입됨
            }

            Dandwac dandwac = account.getDandwAcId();
            BigDecimal regularAmount = account.getSavingRegularPaymentAmount();

            if (dandwac.getBalance().compareTo(regularAmount) < 0) {
                // 잔액 부족 시 처리 (알림 발송 등)
                return;
            }

            // 입출금 계좌에서 금액 차감
            dandwac.setBalance(dandwac.getBalance().subtract(regularAmount));
            dandwacRepository.save(dandwac);

            // 적금 금액 증가
            account.setSavingDepositAmount(account.getSavingDepositAmount().add(regularAmount));
            account.setLastSavingPaymentDate(today);
            savingAccountRepository.save(account);

        } catch (Exception e) {
            throw new RuntimeException("정기 납입 처리 중 오류 발생: " + e.getMessage());
        }
    }

    @Override
    public SavingAccountDTO createSavingAccount(Map<String, Object> request, String memberId) {
        Dandwac dandwac = dandwacRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new RuntimeException("입출금 계좌를 찾을 수 없습니다."));

        if (!request.containsKey("savingDepositAmount") || request.get("savingDepositAmount") == null) {
            throw new RuntimeException("적금 금액을 입력해주세요.");
        }

        if (!request.containsKey("savingRegularPaymentDay") || request.get("savingRegularPaymentDay") == null) {
            throw new RuntimeException("정기 납입일을 입력해주세요.");
        }

        SavingAccountDTO savingAccountDTO = SavingAccountDTO.builder()
                .savingDepositAmount(new BigDecimal(request.get("savingDepositAmount").toString()))
                .savingProductId(Long.parseLong(request.get("savingProductId").toString()))
                .dandwAcId(dandwac.getDandwAcId())
                .savingRegularPaymentDay(Integer.parseInt(request.get("savingRegularPaymentDay").toString()))
                .isSavingRegularPayment(true)
                .build();

        return createSavingAccount(savingAccountDTO);
    }

    @Override
    public List<SavingAccountDTO> getMySavingAccounts(String memberId) {
        Dandwac dandwac = dandwacRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new RuntimeException("입출금 계좌를 찾을 수 없습니다."));

        return getSavingAccountsByDandwAcId(dandwac);
    }

    @Override
    public Map<String, Object> terminateSavingAccount(Long accountNumber, String reason, String memberId) {
        // 계좌 소유권 검증
        validateAccountOwnership(accountNumber, memberId);

        SavingAccount savingAccount = savingAccountRepository.findById(accountNumber)
                .orElseThrow(() -> new RuntimeException("적금 계좌를 찾을 수 없습니다."));

        // 현재 이자 계산
        BigDecimal currentInterest = calculateSavingInterest(accountNumber);

        // 위약금 계산 (중도해지인 경우)
        BigDecimal savingPenaltyFee = BigDecimal.ZERO;
        if (!reason.equals("만기")) {
            double randomRate = 0.015 + new Random().nextDouble() * 0.015; // 1.5% ~ 3%
            savingPenaltyFee = savingAccount.getSavingDepositAmount().multiply(BigDecimal.valueOf(randomRate))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        // 서비스 수수료 0.5%
        BigDecimal savingServiceFee = savingAccount.getSavingDepositAmount().multiply(BigDecimal.valueOf(0.005))
                .setScale(2, RoundingMode.HALF_UP);

        // 총 환급 금액 계산
        BigDecimal totalRefundAmount = savingAccount.getSavingDepositAmount().add(currentInterest)
                .subtract(savingPenaltyFee).subtract(savingServiceFee)
                .setScale(2, RoundingMode.HALF_UP);

        // 계좌 해지 처리
        terminateSavingAccount(accountNumber, reason);

        return Map.of(
                "message", "계좌가 성공적으로 해지되었습니다.",
                "interestEarned", currentInterest,
                "totalRefundAmount", totalRefundAmount
        );
    }

    @Override
    public String setRegularPayment(Long accountNumber, Map<String, Object> request, String memberId) {
        throw new RuntimeException("적금은 정기납입 금액을 변경할 수 없습니다.");
    }

    @Override
    public String cancelRegularPayment(Long accountNumber, String memberId) {
        throw new RuntimeException("적금은 정기납입을 취소할 수 없습니다.");
    }

    private void validateAccountOwnership(Long accountNumber, String memberId) {
        Dandwac dandwac = dandwacRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new RuntimeException("입출금 계좌를 찾을 수 없습니다."));

        List<SavingAccountDTO> accounts = getSavingAccountsByDandwAcId(dandwac);
        boolean hasAccount = accounts.stream()
                .anyMatch(acc -> acc.getSavingAccountNumber().equals(accountNumber));

        if (!hasAccount) {
            throw new RuntimeException("해당 계좌를 찾을 수 없거나 본인의 계좌가 아닙니다.");
        }
    }

    private SavingAccountDTO convertToDTO(SavingAccount savingAccount) {
        return SavingAccountDTO.builder()
                .savingAccountNumber(savingAccount.getSavingAccountNumber())
                .savingDepositAmount(savingAccount.getSavingDepositAmount())
                .savingStartDate(savingAccount.getSavingStartDate())
                .savingEndDate(savingAccount.getSavingEndDate())
                .savingProductId(savingAccount.getSavingProductId().getSavingProductId())
                .dandwAcId(savingAccount.getDandwAcId().getDandwAcId())
                .formattedAccountNumber(String.format("321-%04d-%04d",
                        savingAccount.getSavingAccountNumber() / 10000,
                        savingAccount.getSavingAccountNumber() % 10000))
                .isSavingRegularPayment(savingAccount.getIsSavingRegularPayment())
                .savingRegularPaymentAmount(savingAccount.getSavingRegularPaymentAmount())
                .savingRegularPaymentDay(savingAccount.getSavingRegularPaymentDay())
                .lastSavingPaymentDate(savingAccount.getLastSavingPaymentDate())
                .build();
    }
}
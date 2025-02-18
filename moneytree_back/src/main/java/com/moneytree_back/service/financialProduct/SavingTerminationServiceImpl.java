package com.moneytree_back.service.financialProduct;

import com.moneytree_back.domain.financialProduct.SavingAccountStatus;
import com.moneytree_back.dto.financialProduct.SavingTerminationDTO;
import com.moneytree_back.repository.financialProduct.SavingTerminationRepository;
import com.moneytree_back.domain.financialProduct.SavingTermination;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavingTerminationServiceImpl implements SavingTerminationService {

    private final SavingTerminationRepository savingTerminationRepository;

    @Override
    @Transactional(readOnly = true)
    public SavingTerminationDTO findBySavingAccountNumber(Long savingAccountNumber) {
        Optional<SavingTermination> termination = savingTerminationRepository.findBySavingAccount_SavingAccountNumber(savingAccountNumber);
        return termination
                .filter(t -> t.getSavingAccount().getSavingAccountStatus() == SavingAccountStatus.SAVING_ACCOUNT_TERMINATED)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("해지 내역을 찾을 수 없습니다."));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavingTerminationDTO> findAllTerminations() {
        return savingTerminationRepository.findAll().stream()
                .filter(t -> t.getSavingAccount().getSavingAccountStatus() == SavingAccountStatus.SAVING_ACCOUNT_TERMINATED)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavingTerminationDTO> findTerminationsByMemberId(String memberId) {
        return savingTerminationRepository.findAll().stream()
                .filter(t -> t.getSavingAccount().getDandwAcId().getMember().getMemberId().equals(memberId)
                        && t.getSavingAccount().getSavingAccountStatus() == SavingAccountStatus.SAVING_ACCOUNT_TERMINATED)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private SavingTerminationDTO convertToDTO(SavingTermination termination) {
        return SavingTerminationDTO.builder()
                .savingTerminationId(termination.getSavingTerminationId())
                .savingTerminationDate(termination.getSavingTerminationDate())
                .savingTerminationReason(termination.getSavingTerminationReason())
                .savingPenaltyFee(termination.getSavingPenaltyFee())
                .savingServiceFee(termination.getSavingServiceFee())
                .savingRefundAmount(termination.getSavingRefundAmount())
                .savingAccountNumber(termination.getSavingAccount().getSavingAccountNumber())
                .build();
    }
}
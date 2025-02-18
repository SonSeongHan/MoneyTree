package com.moneytree_back.service.financialProduct;

import com.moneytree_back.domain.financialProduct.DepositAccountStatus;
import com.moneytree_back.dto.financialProduct.DepositTerminationDTO;
import com.moneytree_back.repository.financialProduct.DepositTerminationRepository;
import com.moneytree_back.domain.financialProduct.DepositTermination;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepositTerminationServiceImpl implements DepositTerminationService {

    private final DepositTerminationRepository depositTerminationRepository;

    @Override
    @Transactional(readOnly = true)
    public DepositTerminationDTO findByDepositAccountNumber(Long depositAccountNumber) {
        Optional<DepositTermination> termination = depositTerminationRepository.findByDepositAccount_DepositAccountNumber(depositAccountNumber);
        return termination
                .filter(t -> t.getDepositAccount().getDepositAccountStatus() == DepositAccountStatus.DEPOSIT_ACCOUNT_TERMINATED)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("해지 내역을 찾을 수 없습니다."));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepositTerminationDTO> findAllTerminations() {
        return depositTerminationRepository.findAll().stream()
                .filter(t -> t.getDepositAccount().getDepositAccountStatus() == DepositAccountStatus.DEPOSIT_ACCOUNT_TERMINATED)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DepositTerminationDTO> findTerminationsByMemberId(String memberId) {
        return depositTerminationRepository.findAll().stream()
                .filter(t -> t.getDepositAccount().getDandwAcId().getMember().getMemberId().equals(memberId)
                        && t.getDepositAccount().getDepositAccountStatus() == DepositAccountStatus.DEPOSIT_ACCOUNT_TERMINATED)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private DepositTerminationDTO convertToDTO(DepositTermination termination) {
        return DepositTerminationDTO.builder()
                .depositTerminationId(termination.getDepositTerminationId())
                .depositTerminationDate(termination.getDepositTerminationDate())
                .depositTerminationReason(termination.getDepositTerminationReason())
                .depositPenaltyFee(termination.getDepositPenaltyFee())
                .depositServiceFee(termination.getDepositServiceFee())
                .depositRefundAmount(termination.getDepositRefundAmount())
                .depositAccountNumber(termination.getDepositAccount().getDepositAccountNumber())
                .build();
    }
}

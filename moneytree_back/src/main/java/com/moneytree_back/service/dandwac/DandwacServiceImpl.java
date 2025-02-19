package com.moneytree_back.service.dandwac;

import com.moneytree_back.domain.Dandwac;
import com.moneytree_back.domain.financialProduct.FundAccount;
import com.moneytree_back.domain.financialProduct.StockAccount;
import com.moneytree_back.domain.member.Member;
import com.moneytree_back.domain.member.MembershipType;
import com.moneytree_back.domain.TransactionHistory;
import com.moneytree_back.dto.DandwacDTO;
import com.moneytree_back.repository.DandwacRepository;
import com.moneytree_back.repository.MemberRepository;
import com.moneytree_back.repository.TransactionHistoryRepository;
import com.moneytree_back.repository.financialProduct.FundAccountRepository;
import com.moneytree_back.repository.financialProduct.StockAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DandwacServiceImpl implements DandwacService {

    private final DandwacRepository dandwAccountRepository;
    private final MemberRepository memberRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final StockAccountRepository stockAccountRepository;
    private final FundAccountRepository fundAccountRepository;

    @Override
    public Dandwac createAccount(DandwacDTO dto) {
        // (1) Member 조회
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원 ID입니다."));

        // (2) Dandwac 엔티티 생성
        Dandwac account = new Dandwac();
        account.setDandwAcId(dto.getDandwAcId());
        account.setMember(member);
        account.setAccountType(dto.getAccountType());
        account.setBalance(dto.getBalance());
        account.setAccountPassword(dto.getAccountPassword());
        account.setCreatedAt(LocalDate.now());

        // (3) 계좌 저장
        dandwAccountRepository.save(account);

        // (4) Member 업데이트
        member.setMember_accountNumber(account.getDandwAcId());
        member.setMembershipType(MembershipType.FullMember);
        memberRepository.save(member);

        return account;
    }

    // 계좌 번호 조회 (02.17 손성한)
    @Override
    public String getDandwacAccountNumberByMemberId(String memberId) {
        Dandwac dandwac = dandwAccountRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원의 입출금 계좌를 찾을 수 없습니다."));
        return dandwac.getDandwAcId();
    }

    // 계좌 잔액 조회 (02.17 손성한)
    @Override
    public BigDecimal getDandwacBalance(String dandwAcId) {
        Dandwac account = dandwAccountRepository.findById(dandwAcId)
                .orElseThrow(() -> new IllegalArgumentException("해당 입출금 계좌를 찾을 수 없습니다."));
        return account.getBalance();
    }

    @Override
    public Dandwac getAccount(String dandwAcId) {
        return dandwAccountRepository.findById(dandwAcId)
                .orElseThrow(() -> new IllegalArgumentException("해당 계좌를 찾을 수 없습니다."));
    }

    @Override
    public Dandwac findAccountByMemberId(String memberId) {
        return dandwAccountRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원의 계좌를 찾을 수 없습니다."));
    }

    @Transactional
    @Override
    public void transferToStockAccount(String dandwAcId, Long stockAccountNumber, BigDecimal amount) {
        Dandwac dandwac = dandwAccountRepository.findById(dandwAcId)
                .orElseThrow(() -> new IllegalArgumentException("입출금 계좌를 찾을 수 없습니다."));

        StockAccount stockAccount = stockAccountRepository.findById(stockAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("주식 계좌를 찾을 수 없습니다."));

        if (dandwac.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("잔액이 부족합니다.");
        }

        dandwac.setBalance(dandwac.getBalance().subtract(amount));
        stockAccount.setStockAccountBalance(stockAccount.getStockAccountBalance().add(amount));

        dandwAccountRepository.save(dandwac);
        stockAccountRepository.save(stockAccount);
    }

    /**
     * 송금 (내 계좌 → receiverAccountId)
     */
    @Transactional
    @Override
    public void transferMoney(String memberId,
                              String receiverAccountId,
                              BigDecimal amount,
                              String password,
                              String depositPurpose,
                              String fromMemberNameParam, // 프론트에서 온 값(굳이 안 써도 됨)
                              String toMemberName)
    {
        // 1) 송금자 계좌 조회 (memberId → Dandwac → Member)
        Dandwac senderAccount = dandwAccountRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new IllegalArgumentException("송금자 계좌를 찾을 수 없습니다."));

        // 2) 비밀번호 확인
        if (!senderAccount.getAccountPassword().equals(password)) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        // 3) 실제 '보낸사람 닉네임'을 DB에서 가져오기
        //    여기서는 Member 엔티티의 어떤 필드를 닉네임으로 쓸 건지 결정 (예: senderAccount.getMember().getMemberName())
        String realSenderNickname = senderAccount.getMember().getMemberName();

        // 4) 수신자 계좌 조회
        Dandwac receiverAccount = dandwAccountRepository.findById(receiverAccountId)
                .orElseThrow(() -> new IllegalArgumentException("수신자 계좌를 찾을 수 없습니다."));

        // 5) 잔액 차감 & 추가
        if (senderAccount.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("잔액이 부족합니다.");
        }
        senderAccount.setBalance(senderAccount.getBalance().subtract(amount));
        receiverAccount.setBalance(receiverAccount.getBalance().add(amount));

        dandwAccountRepository.save(senderAccount);
        dandwAccountRepository.save(receiverAccount);

        // 6) 거래 내역 기록
        TransactionHistory history = TransactionHistory.builder()
                .fromAccount(senderAccount)
                .toAccount(receiverAccount)
                .amount(amount)
                .dandwacType(senderAccount.getAccountType())
                .createdAt(LocalDateTime.now())
                .depositPurpose(depositPurpose)
                // ★ DB에서 가져온 보낸사람 닉네임(또는 이름)을 직접 세팅
                .fromMemberName(realSenderNickname)
                // ★ 받는 사람 닉네임(이름)은 파라미터로 온 그대로 씀 (toMemberName)
                .toMemberName(toMemberName)
                .build();

        transactionHistoryRepository.save(history);
    }


    /**
     * 입금(충전) 기능
     */
    @Transactional
    @Override
    public void depositMoney(String memberId,
                             String password,
                             BigDecimal amount,
                             String depositPurpose) {
        // (1) 회원의 계좌 조회
        Dandwac account = findAccountByMemberId(memberId);

        // (2) 비밀번호 확인
        if (!account.getAccountPassword().equals(password)) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        // (3) 잔액 업데이트 (입금)
        account.setBalance(account.getBalance().add(amount));
        dandwAccountRepository.save(account);

        // (4) 거래 내역 기록
        TransactionHistory history = TransactionHistory.builder()
                .fromAccount(null)  // 입금은 송금자가 없으므로 null
                .toAccount(account)
                .amount(amount)
                .dandwacType(account.getAccountType())
                .createdAt(LocalDateTime.now())
                .depositPurpose(depositPurpose) // ✅ 충전 목적
                .build();

        transactionHistoryRepository.save(history);
    }


}

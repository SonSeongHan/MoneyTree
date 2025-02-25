package com.moneytree_back.service;

import com.moneytree_back.domain.Apartment;
import com.moneytree_back.domain.MemberLoan;
import com.moneytree_back.repository.ApartmentRepository;
import com.moneytree_back.repository.MemberLoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ApartmentOwnerAssignService {

    private final ApartmentRepository apartmentRepository;
    private final MemberLoanRepository memberLoanRepository;

    @Transactional
    public void assignOwnersRandomly() {
        List<Apartment> allApartments = apartmentRepository.findAll();
        List<MemberLoan> memberLoans = memberLoanRepository.findAll();

        if (memberLoans.isEmpty()) {
            throw new RuntimeException("member_loan에 데이터가 없어서 소유자를 배분할 수 없습니다.");
        }


        Random random = new Random();
        for (Apartment apt : allApartments) {
            int idx = random.nextInt(memberLoans.size());
            MemberLoan chosenLoan = memberLoans.get(idx);

            // 여기가 핵심: 실제로 ownerId를 설정
            apt.setOwnerId(chosenLoan.getMemberId());
        }

        // 변경사항을 DB에 반영
        apartmentRepository.saveAll(allApartments);
    }
}

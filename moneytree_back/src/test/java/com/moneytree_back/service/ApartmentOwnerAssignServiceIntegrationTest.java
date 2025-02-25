package com.moneytree_back.service;

import com.moneytree_back.domain.Apartment;
import com.moneytree_back.domain.MemberLoan;
import com.moneytree_back.repository.ApartmentRepository;
import com.moneytree_back.repository.MemberLoanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 실제 DB에 접근하여 assignOwnersRandomly()가 owner_id 컬럼을 업데이트하는지 확인하는 통합 테스트 예시
 */

//moan loan에 있는 member id 기반으로 랜덤하게 apartment db에 있는 owner id(아파트소유자)에 member id 주입
@ExtendWith(SpringExtension.class)
@SpringBootTest
@Transactional
@Rollback(false)
class ApartmentOwnerAssignServiceIntegrationTest {

    @Autowired
    private ApartmentOwnerAssignService apartmentOwnerAssignService;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private MemberLoanRepository memberLoanRepository;

    @BeforeEach
    void setUp() {
        // 1) 테스트용 아파트 데이터 INSERT
        Apartment apt1 = Apartment.builder()
                .name("테스트아파트1")
                .roadAddress("서울시 강남구 테스트1")
                .ownerId(null) // 처음엔 소유자 미지정
                .build();

        Apartment apt2 = Apartment.builder()
                .name("테스트아파트2")
                .roadAddress("서울시 강남구 테스트2")
                .ownerId(null)
                .build();

        // DB에 저장
        apartmentRepository.saveAll(Arrays.asList(apt1, apt2));

        // 2) 테스트용 member_loan 데이터 INSERT
        MemberLoan loanA = new MemberLoan();
        loanA.setMemberId("memberA");
        loanA.setMaxLoanLimit(100_000_000L);
        memberLoanRepository.save(loanA);

        MemberLoan loanB = new MemberLoan();
        loanB.setMemberId("memberB");
        loanB.setMaxLoanLimit(200_000_000L);
        memberLoanRepository.save(loanB);

        // 필요하다면 더 추가
    }

    @Test
    void testAssignOwnersRandomly_Integration() {
        // 1) 현재 DB에 있는 아파트 확인
        List<Apartment> beforeList = apartmentRepository.findAll();
        assertFalse(beforeList.isEmpty(), "테스트 전 아파트가 존재해야 합니다.");

        // 2) Service 메서드 실행
        apartmentOwnerAssignService.assignOwnersRandomly();

        // 3) DB에서 다시 조회
        List<Apartment> afterList = apartmentRepository.findAll();
        assertEquals(beforeList.size(), afterList.size(), "아파트 개수는 동일해야 합니다.");

        // 4) member_loan 테이블에 있는 memberId 목록
        List<MemberLoan> memberLoans = memberLoanRepository.findAll();
        Set<String> possibleOwnerIds = memberLoans.stream()
                .map(MemberLoan::getMemberId)
                .collect(Collectors.toSet());

        // 5) 각 아파트의 ownerId가 실제로 업데이트되었는지 확인
        for (Apartment apt : afterList) {
            assertNotNull(apt.getOwnerId(), "assignOwnersRandomly() 이후에는 ownerId가 null이 아니어야 합니다.");
            assertTrue(possibleOwnerIds.contains(apt.getOwnerId()),
                    "ownerId가 member_loan의 memberId 중 하나여야 합니다. 실제 ownerId=" + apt.getOwnerId());
        }
    }
}

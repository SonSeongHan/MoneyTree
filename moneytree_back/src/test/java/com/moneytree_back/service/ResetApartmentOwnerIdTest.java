package com.moneytree_back.service;

import com.moneytree_back.domain.Apartment;
import com.moneytree_back.repository.ApartmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.annotation.Rollback;

import java.util.List;

@ExtendWith(SpringExtension.class)
@SpringBootTest
class ResetApartmentOwnerIdTest {

    @Autowired
    private ApartmentRepository apartmentRepository;

    /**
     * 모든 Apartment의 ownerId를 null로 초기화.
     * @Rollback(false)를 사용해야 실제 DB에 반영됨.
     */
    @Test
    @Transactional
    @Rollback(false)  // <- 이걸 붙이면 트랜잭션 커밋되어 DB에 반영됩니다.
    void resetAllOwnerIds() {
        // 1) 전체 아파트 조회
        List<Apartment> allApartments = apartmentRepository.findAll();

        // 2) 각 아파트의 ownerId를 null로 세팅
        for (Apartment apt : allApartments) {
            apt.setOwnerId(null);
        }

        // 3) 저장 (일괄 업데이트)
        apartmentRepository.saveAll(allApartments);

        // 여기서 로그 찍거나 검증 가능
        System.out.println("모든 Apartment의 owner_id를 null로 초기화했습니다. (총 " + allApartments.size() + "개)");
    }
}

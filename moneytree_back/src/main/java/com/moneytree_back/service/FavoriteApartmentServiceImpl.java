package com.moneytree_back.service;

import com.moneytree_back.domain.Apartment;
import com.moneytree_back.domain.FavoriteApartment;
import com.moneytree_back.domain.member.Member;
import com.moneytree_back.dto.FavoriteApartmentDTO;
import com.moneytree_back.repository.ApartmentRepository;
import com.moneytree_back.repository.FavoriteApartmentRepository;
import com.moneytree_back.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteApartmentServiceImpl implements FavoriteApartmentService {

  private final FavoriteApartmentRepository favoriteApartmentRepository;
  private final MemberRepository memberRepository;
  private final ApartmentRepository apartmentRepository;

  // 엔티티를 DTO로 변환하는 메서드
  private FavoriteApartmentDTO convertToDto(FavoriteApartment favoriteApartment) {
    Apartment apt = favoriteApartment.getApartment();
    return FavoriteApartmentDTO.builder()
            .id(favoriteApartment.getId())
            .memberId(favoriteApartment.getMember().getMemberId())
            .apartmentId(favoriteApartment.getApartment().getId())
            .apartmentName(apt.getName())        // DB에 저장된 아파트 단지명
            .area(apt.getArea())                   // 전용면적
            .currentPrice(apt.getCurrentPrice())   // 최신 거래가
            .createdAt(favoriteApartment.getCreatedAt())
            .build();
  }

  @Override
  @Transactional
  public FavoriteApartmentDTO addFavoriteApartment(String memberId, String apartmentName) {
    // 전달받은 memberId를 디코딩 (예: "간편회원1" -> "간편회원1")
    String decodedMemberId = URLDecoder.decode(memberId, StandardCharsets.UTF_8);
    Member member = memberRepository.findByMemberId(decodedMemberId)
            .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
    Apartment apartment = apartmentRepository.findByName(apartmentName)
            .orElseThrow(() -> new RuntimeException("아파트를 찾을 수 없습니다."));

    if (favoriteApartmentRepository.existsByMemberAndApartment(member, apartment)) {
      throw new RuntimeException("이미 관심 매물에 등록된 아파트입니다.");
    }

    FavoriteApartment favoriteApartment = FavoriteApartment.builder()
            .member(member)
            .apartment(apartment)
            .build();

    FavoriteApartment savedFavorite = favoriteApartmentRepository.save(favoriteApartment);
    return convertToDto(savedFavorite);
  }

  @Override
  @Transactional
  public void removeFavoriteApartment(String memberId, String apartmentName) {
    String decodedMemberId = URLDecoder.decode(memberId, StandardCharsets.UTF_8);
    Member member = memberRepository.findByMemberId(decodedMemberId)
            .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
    Apartment apartment = apartmentRepository.findByName(apartmentName)
            .orElseThrow(() -> new RuntimeException("아파트를 찾을 수 없습니다."));

    favoriteApartmentRepository.deleteByMemberAndApartment(member, apartment);
  }

  @Override
  public List<FavoriteApartmentDTO> getFavoriteApartmentsByMember(String memberId) {
    String decodedMemberId = URLDecoder.decode(memberId, StandardCharsets.UTF_8);
    Member member = memberRepository.findByMemberId(decodedMemberId)
            .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
    List<FavoriteApartment> favorites = favoriteApartmentRepository.findByMember(member);
    return favorites.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
  }
}

package com.moneytree_back.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
@Entity
@Table(name = "hobby")
public class Hobby {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 취미 이름
    @Column(name = "hobby_name", nullable = false)
    private String hobbyName;

    // 취미 가격 (예: 고급 취미의 경우 가격 정보)
    @Column(name = "hobby_price", nullable = false)
    private BigDecimal hobbyPrice;

    // 취미 설명
    @Column(name = "hobby_description", nullable = false, length = 1000)
    private String hobbyDescription;

    // 취미 카테고리 (예: "자격증", "명품", "예술", "여행" 등)
    @Column(name = "hobby_category", nullable = false)
    private String hobbyCategory;

    // 기본 생성자 (JPA에서 필요)
    public Hobby() {}

    // 편리한 생성자
    public Hobby(String hobbyName, BigDecimal hobbyPrice, String hobbyDescription, String hobbyCategory) {
        this.hobbyName = hobbyName;
        this.hobbyPrice = hobbyPrice;
        this.hobbyDescription = hobbyDescription;
        this.hobbyCategory = hobbyCategory;
    }

    // Getters 및 Setters

    public void setHobbyName(String hobbyName) {
        this.hobbyName = hobbyName;
    }

    public void setHobbyPrice(BigDecimal hobbyPrice) {
        this.hobbyPrice = hobbyPrice;
    }

    public void setHobbyDescription(String hobbyDescription) {
        this.hobbyDescription = hobbyDescription;
    }

    public void setHobbyCategory(String hobbyCategory) {
        this.hobbyCategory = hobbyCategory;
    }

    @Override
    public String toString() {
        return "Hobby{" +
                "id=" + id +
                ", hobbyName='" + hobbyName + '\'' +
                ", hobbyPrice=" + hobbyPrice +
                ", hobbyDescription='" + hobbyDescription + '\'' +
                ", hobbyCategory='" + hobbyCategory + '\'' +
                '}';
    }
}
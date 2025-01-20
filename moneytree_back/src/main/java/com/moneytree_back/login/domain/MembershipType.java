package com.moneytree_back.login.domain;

public enum MembershipType {


    SimpleMember,   // 주민등록번호 7자리 or null
    FullMember,    // 주민등록번호 13자리
    ADMIN,
    FundManager,
    LoanManager,
    RealEstateManager,
    InquiryManager,
    CommunityManager,
}

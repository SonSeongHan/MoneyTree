package com.moneytree_back.controller;

import com.moneytree_back.dto.ApartmentTransactionDTO;
import com.moneytree_back.service.ApartmentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class SellerAuthController {

    private final ApartmentTransactionService transactionService;

    @GetMapping("/seller-auth")
    public String sellerAuth(@RequestParam("transactionId") Long transactionId,
                             @RequestParam("memberId") String memberId,
                             Model model) {
        ApartmentTransactionDTO transaction = transactionService.getTransaction(transactionId);
        if (!transaction.getSellerId().equals(memberId)) {
            throw new RuntimeException("매도자만 인증 문서를 생성할 수 있습니다.");
        }
        model.addAttribute("transaction", transaction);
        return "seller-auth"; // 템플릿: src/main/resources/templates/seller-auth.html
    }
}

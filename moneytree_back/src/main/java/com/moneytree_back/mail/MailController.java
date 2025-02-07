// src/main/java/com/moneytree_back/controller/MailController.java
package com.moneytree_back.mail;

import com.moneytree_back.mail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    /**
     * 이메일로 인증번호 발송 엔드포인트
     * 프론트엔드에서 /api/mail/send-verification?email=사용자이메일 형태로 호출
     */
    @PostMapping("/send-verification")
    public ResponseEntity<String> sendVerification(@RequestParam String email) {
        try {
            mailService.sendVerificationEmail(email);
            return ResponseEntity.ok("인증번호 전송 성공");
        } catch (MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("인증번호 전송 실패");
        }
    }

    /**
     * 이메일과 사용자가 입력한 인증번호를 검증하는 엔드포인트
     * 프론트엔드에서 /api/mail/verify?email=사용자이메일&code=입력한인증번호 형태로 호출
     */
    @PostMapping("/verify")
    public ResponseEntity<String> verifyCode(@RequestParam String email, @RequestParam String code) {
        boolean isValid = mailService.verifyCode(email, code);
        if (isValid) {
            return ResponseEntity.ok("인증 성공");
        } else {
            return ResponseEntity.badRequest().body("인증 실패");
        }
    }
}

// src/main/java/com/moneytree_back/service/MailService.java
package com.moneytree_back.mail;

import com.moneytree_back.mail.EmailSender;
import com.moneytree_back.mail.VerificationCodeGenerator;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MailService {

    // 이메일별 인증번호를 메모리에 저장 (운영 시 Redis나 DB 사용 권장)
    private ConcurrentHashMap<String, String> verificationCodes = new ConcurrentHashMap<>();

    /**
     * 이메일로 인증번호를 발송하고, 생성한 코드를 저장합니다.
     * @param email 사용자가 입력한 이메일
     */
    public void sendVerificationEmail(String email) throws MessagingException {
        String code = VerificationCodeGenerator.generateCode(6);
        // 실제 이메일 발송
        EmailSender.sendVerificationEmail(email, code);
        // 인증번호 저장 (추후 검증을 위해)
        verificationCodes.put(email, code);
        // TODO: 코드 유효기간(예: 10분) 이후 자동 삭제 로직 구현 필요
    }

    /**
     * 저장된 인증번호와 사용자가 입력한 코드가 일치하는지 검증합니다.
     * 검증 성공 시 해당 코드를 삭제합니다.
     * @param email 사용자 이메일
     * @param code 사용자가 입력한 인증번호
     * @return 검증 성공 여부
     */
    public boolean verifyCode(String email, String code) {
        if (verificationCodes.containsKey(email) && verificationCodes.get(email).equals(code)) {
            verificationCodes.remove(email);
            return true;
        }
        return false;
    }
}

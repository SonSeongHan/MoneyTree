// src/main/java/com/moneytree_back/mail/VerificationCodeGenerator.java
package com.moneytree_back.mail;

import java.util.Random;

public class VerificationCodeGenerator {
    public static String generateCode(int length) {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < length; i++) {
            code.append(random.nextInt(10)); // 0 ~ 9 사이의 숫자
        }
        return code.toString();
    }
}

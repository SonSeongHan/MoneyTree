// src/main/java/com/moneytree_back/mail/EmailSender.java
package com.moneytree_back.mail;

import javax.mail.*;
import javax.mail.internet.*;
import java.util.Properties;

public class EmailSender {
    public static void sendVerificationEmail(String recipientEmail, String verificationCode) throws MessagingException {
        // SMTP 서버 설정 (예: 네이버 SMTP)
        String host = "smtp.naver.com";
        final String username = ""; // 실제 네이버 이메일 주소
        final String password = "";    // 앱 비밀번호 또는 올바른 비밀번호

        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.naver.com");
        props.put("mail.smtp.port", "465"); // TLS 포트 (또는 SSL 포트 465 사용 가능)
        props.put("mail.smtp.auth", "true");
//       // props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.ssl.enable", "true");      // SSL 활성화

        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(username));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail));
        message.setSubject("회원가입 이메일 인증번호");

        String emailContent = "안녕하세요,\n\n회원가입을 위한 인증번호는 [" + verificationCode + "] 입니다.\n"
                + "인증번호는 10분간 유효합니다.";
        message.setText(emailContent);

        Transport.send(message);
    }
}

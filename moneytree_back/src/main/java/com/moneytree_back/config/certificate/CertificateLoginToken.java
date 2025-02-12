package com.moneytree_back.config.certificate;

import lombok.Getter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

/**
 * 문서 인증에 필요한 정보(fileContent, parsedId, parsedName)를 저장하는 Token
 */
@Getter
public class CertificateLoginToken extends AbstractAuthenticationToken {

    private final String fileContent;
    private final String parsedId;
    private final String parsedName;

    // 인증 전
    public CertificateLoginToken(String fileContent, String parsedId, String parsedName) {
        super(null);
        this.fileContent = fileContent;
        this.parsedId = parsedId;
        this.parsedName = parsedName;
        setAuthenticated(false);
    }

    // 인증 후
    public CertificateLoginToken(String fileContent, String parsedId, String parsedName,
                                 Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.fileContent = fileContent;
        this.parsedId = parsedId;
        this.parsedName = parsedName;
        super.setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return fileContent; // 문서 내용이 Credentials
    }

    @Override
    public Object getPrincipal() {
        return parsedId; // ID를 principal로 간주
    }

    @Override
    public void setAuthenticated(boolean authenticated) throws IllegalArgumentException {
        if (authenticated) {
            throw new IllegalArgumentException("Cannot set this token to trusted - use constructor");
        }
        super.setAuthenticated(false);
    }
}

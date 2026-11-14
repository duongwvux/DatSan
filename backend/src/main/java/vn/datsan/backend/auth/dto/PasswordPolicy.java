package vn.datsan.backend.auth.dto;

import java.nio.charset.StandardCharsets;

public final class PasswordPolicy {
    private PasswordPolicy() {

    }

    public static void validate(String password) {
        int characters = password.codePointCount(0, password.length());

        int bytes = password.getBytes(StandardCharsets.UTF_8).length;

        if (characters < 8 || bytes > 72) {
            
        }
        
    }
}

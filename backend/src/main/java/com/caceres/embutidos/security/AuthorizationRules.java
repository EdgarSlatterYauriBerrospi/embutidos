package com.caceres.embutidos.security;

public final class AuthorizationRules {

    public static final String ADMIN_ONLY = "hasRole('ADMIN')";
    public static final String ADMIN_OR_EMPLOYEE = "hasAnyRole('ADMIN', 'EMPLOYEE')";

    private AuthorizationRules() {
    }
}

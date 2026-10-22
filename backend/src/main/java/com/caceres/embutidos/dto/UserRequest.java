package com.caceres.embutidos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Email @Size(max = 255) String email,
        String password,
        @NotBlank
        @Pattern(regexp = "ADMIN|EMPLOYEE", message = "Role must be ADMIN or EMPLOYEE")
        String role
) {
}

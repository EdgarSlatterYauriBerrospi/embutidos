package com.caceres.embutidos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SupplierRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 255) String phone,
        @Email @Size(max = 255) String email,
        @Size(max = 255) String address
) {
}

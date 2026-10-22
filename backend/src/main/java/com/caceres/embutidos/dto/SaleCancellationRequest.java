package com.caceres.embutidos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SaleCancellationRequest(
        @NotBlank @Size(max = 500) String reason
) {
}

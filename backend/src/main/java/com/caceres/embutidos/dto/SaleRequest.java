package com.caceres.embutidos.dto;

import java.util.List;

import com.caceres.embutidos.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SaleRequest(
        @NotNull Long userId,
        @NotNull PaymentMethod paymentMethod,
        @Size(max = 255) String paymentReference,
        @NotEmpty List<@NotNull @Valid SaleLineRequest> lines
) {
}

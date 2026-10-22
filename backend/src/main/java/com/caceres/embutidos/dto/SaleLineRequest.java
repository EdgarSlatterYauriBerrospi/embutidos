package com.caceres.embutidos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SaleLineRequest(
        @NotNull Long productId,
        @NotNull @Min(1) Integer quantity
) {
}

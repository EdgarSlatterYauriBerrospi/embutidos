package com.caceres.embutidos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ProductBatchRequest(
        @NotNull Long productId,
        @NotNull @Min(0) Integer quantity,
        @NotNull LocalDate expirationDate,
        @NotNull LocalDate entryDate,
        @NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal purchasePrice
) {
}

package com.caceres.embutidos.dto;

import com.caceres.embutidos.entity.StockMovementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StockMovementRequest(
        @NotNull Long productId,
        @NotNull Long userId,
        @NotNull @Min(1) Integer quantity,
        @NotNull StockMovementType type,
        @Size(max = 500) String reason
) {
}

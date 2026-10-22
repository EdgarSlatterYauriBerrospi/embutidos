package com.caceres.embutidos.dto;

import java.time.LocalDateTime;

import com.caceres.embutidos.entity.StockMovementType;

public record StockMovementResponse(
        Long id,
        int quantity,
        LocalDateTime movementDate,
        String reason,
        StockMovementType type,
        Long productId,
        Long userId
) {
}

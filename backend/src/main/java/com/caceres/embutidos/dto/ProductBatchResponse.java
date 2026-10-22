package com.caceres.embutidos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductBatchResponse(
        Long id,
        Long productId,
        int quantity,
        LocalDate expirationDate,
        LocalDate entryDate,
        BigDecimal purchasePrice,
        boolean active
) {
}

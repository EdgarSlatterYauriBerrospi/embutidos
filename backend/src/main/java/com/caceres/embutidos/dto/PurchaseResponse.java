package com.caceres.embutidos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PurchaseResponse(
        Long id,
        LocalDateTime purchaseDate,
        BigDecimal total,
        String invoiceNumber,
        Long supplierId,
        Long userId,
        List<PurchaseLineResponse> lines
) {
}

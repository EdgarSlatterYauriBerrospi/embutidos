package com.caceres.embutidos.dto;

import java.math.BigDecimal;

public record PurchaseLineResponse(
        Long id,
        Long productId,
        int quantity,
        BigDecimal unitCost,
        BigDecimal subtotal
) {
}

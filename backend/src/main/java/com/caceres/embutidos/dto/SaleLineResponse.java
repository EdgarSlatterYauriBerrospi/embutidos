package com.caceres.embutidos.dto;

import java.math.BigDecimal;

public record SaleLineResponse(
        Long id,
        Long productId,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
}

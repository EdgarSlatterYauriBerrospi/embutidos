package com.caceres.embutidos.dto;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        int stock,
        int minimumStock,
        String imageUrl,
        boolean active
) {
}

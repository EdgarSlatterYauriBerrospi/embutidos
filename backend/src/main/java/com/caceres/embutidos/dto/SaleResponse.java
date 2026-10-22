package com.caceres.embutidos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.caceres.embutidos.entity.PaymentMethod;
import com.caceres.embutidos.entity.SaleStatus;

public record SaleResponse(
        Long id,
        LocalDateTime saleDate,
        BigDecimal total,
        PaymentMethod paymentMethod,
        String paymentReference,
        Long userId,
        List<SaleLineResponse> lines,
        SaleStatus status,
        LocalDateTime cancellationDate,
        String cancellationReason,
        Long cancelledByUserId
) {
}

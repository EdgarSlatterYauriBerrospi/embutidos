package com.caceres.embutidos.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PurchaseRequest(
        @NotNull Long supplierId,
        @NotNull Long userId,
        @Size(max = 100) String invoiceNumber,
        @NotEmpty List<@NotNull @Valid PurchaseLineRequest> lines
) {
}

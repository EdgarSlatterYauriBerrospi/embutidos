package com.caceres.embutidos.service;

import java.util.List;

import com.caceres.embutidos.dto.SaleRequest;
import com.caceres.embutidos.dto.SaleResponse;
import com.caceres.embutidos.dto.SaleCancellationRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public interface SaleService {

    SaleResponse createSale(@NotNull @Valid SaleRequest request);

    SaleResponse getSaleById(Long id);

    SaleResponse getSaleByIdForUser(Long id, String userEmail);

    List<SaleResponse> getAllSales();

    List<SaleResponse> getSalesByUserEmail(String userEmail);

    SaleResponse cancelSale(Long id, @NotNull @Valid SaleCancellationRequest request, String userEmail);
}

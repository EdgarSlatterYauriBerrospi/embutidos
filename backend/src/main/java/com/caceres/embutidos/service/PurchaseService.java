package com.caceres.embutidos.service;

import java.util.List;

import com.caceres.embutidos.dto.PurchaseRequest;
import com.caceres.embutidos.dto.PurchaseResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public interface PurchaseService {

    PurchaseResponse createPurchase(@NotNull @Valid PurchaseRequest request);

    PurchaseResponse getPurchaseById(Long id);

    List<PurchaseResponse> getAllPurchases();
}

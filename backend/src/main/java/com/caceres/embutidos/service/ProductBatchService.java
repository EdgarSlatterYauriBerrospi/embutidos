package com.caceres.embutidos.service;

import java.time.LocalDate;
import java.util.List;

import com.caceres.embutidos.dto.ProductBatchRequest;
import com.caceres.embutidos.dto.ProductBatchResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public interface ProductBatchService {

    ProductBatchResponse createBatch(@NotNull @Valid ProductBatchRequest request);

    ProductBatchResponse getBatchById(Long id);

    List<ProductBatchResponse> getAllBatches();

    List<ProductBatchResponse> getBatchesByProduct(@NotNull Long productId);

    List<ProductBatchResponse> getExpiringBatches(@NotNull LocalDate fromDate, @NotNull LocalDate toDate);

    void deactivateBatch(Long id);
}

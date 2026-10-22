package com.caceres.embutidos.service;

import java.util.List;

import com.caceres.embutidos.dto.StockMovementRequest;
import com.caceres.embutidos.dto.StockMovementResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public interface StockMovementService {

    List<StockMovementResponse> getAllMovements();

    List<StockMovementResponse> getMovementsByProduct(@NotNull Long productId);

    StockMovementResponse createManualAdjustment(@NotNull @Valid StockMovementRequest request);
}

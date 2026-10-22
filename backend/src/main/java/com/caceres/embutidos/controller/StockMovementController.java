package com.caceres.embutidos.controller;

import java.util.List;

import com.caceres.embutidos.dto.StockMovementRequest;
import com.caceres.embutidos.dto.StockMovementResponse;
import com.caceres.embutidos.security.AuthorizationRules;
import com.caceres.embutidos.service.StockMovementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    public StockMovementController(StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    @GetMapping
    @PreAuthorize(AuthorizationRules.ADMIN_ONLY)
    public ResponseEntity<List<StockMovementResponse>> getAllMovements() {
        return ResponseEntity.ok(stockMovementService.getAllMovements());
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize(AuthorizationRules.ADMIN_OR_EMPLOYEE)
    public ResponseEntity<List<StockMovementResponse>> getMovementsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(stockMovementService.getMovementsByProduct(productId));
    }

    @PostMapping("/adjustments")
    @PreAuthorize(AuthorizationRules.ADMIN_ONLY)
    public ResponseEntity<StockMovementResponse> createManualAdjustment(
            @Valid @RequestBody StockMovementRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(stockMovementService.createManualAdjustment(request));
    }
}

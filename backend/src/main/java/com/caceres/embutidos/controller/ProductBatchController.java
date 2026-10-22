package com.caceres.embutidos.controller;

import java.time.LocalDate;
import java.util.List;

import com.caceres.embutidos.dto.ProductBatchRequest;
import com.caceres.embutidos.dto.ProductBatchResponse;
import com.caceres.embutidos.security.AuthorizationRules;
import com.caceres.embutidos.service.ProductBatchService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/product-batches")
public class ProductBatchController {

    private final ProductBatchService productBatchService;

    public ProductBatchController(ProductBatchService productBatchService) {
        this.productBatchService = productBatchService;
    }

    @PostMapping
    @PreAuthorize(AuthorizationRules.ADMIN_ONLY)
    public ResponseEntity<ProductBatchResponse> createBatch(@Valid @RequestBody ProductBatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productBatchService.createBatch(request));
    }

    @GetMapping
    @PreAuthorize(AuthorizationRules.ADMIN_OR_EMPLOYEE)
    public ResponseEntity<List<ProductBatchResponse>> getAllBatches() {
        return ResponseEntity.ok(productBatchService.getAllBatches());
    }

    @GetMapping("/{id}")
    @PreAuthorize(AuthorizationRules.ADMIN_OR_EMPLOYEE)
    public ResponseEntity<ProductBatchResponse> getBatchById(@PathVariable Long id) {
        return ResponseEntity.ok(productBatchService.getBatchById(id));
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize(AuthorizationRules.ADMIN_OR_EMPLOYEE)
    public ResponseEntity<List<ProductBatchResponse>> getBatchesByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productBatchService.getBatchesByProduct(productId));
    }

    @GetMapping("/expiring")
    @PreAuthorize(AuthorizationRules.ADMIN_OR_EMPLOYEE)
    public ResponseEntity<List<ProductBatchResponse>> getExpiringBatches(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return ResponseEntity.ok(productBatchService.getExpiringBatches(fromDate, toDate));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize(AuthorizationRules.ADMIN_ONLY)
    public ResponseEntity<Void> deactivateBatch(@PathVariable Long id) {
        productBatchService.deactivateBatch(id);
        return ResponseEntity.ok().build();
    }
}

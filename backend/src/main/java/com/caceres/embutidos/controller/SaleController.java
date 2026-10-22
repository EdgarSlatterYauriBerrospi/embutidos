package com.caceres.embutidos.controller;

import java.util.List;

import com.caceres.embutidos.dto.SaleRequest;
import com.caceres.embutidos.dto.SaleResponse;
import com.caceres.embutidos.dto.SaleCancellationRequest;
import com.caceres.embutidos.security.AuthorizationRules;
import com.caceres.embutidos.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    @PreAuthorize(AuthorizationRules.ADMIN_OR_EMPLOYEE)
    public ResponseEntity<SaleResponse> createSale(@Valid @RequestBody SaleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.createSale(request));
    }

    @GetMapping
    @PreAuthorize(AuthorizationRules.ADMIN_OR_EMPLOYEE)
    public ResponseEntity<List<SaleResponse>> getAllSales(Authentication authentication) {
        List<SaleResponse> sales = isAdmin(authentication)
                ? saleService.getAllSales()
                : saleService.getSalesByUserEmail(authentication.getName());
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/{id}")
    @PreAuthorize(AuthorizationRules.ADMIN_OR_EMPLOYEE)
    public ResponseEntity<SaleResponse> getSaleById(@PathVariable Long id, Authentication authentication) {
        SaleResponse sale = isAdmin(authentication)
                ? saleService.getSaleById(id)
                : saleService.getSaleByIdForUser(id, authentication.getName());
        return ResponseEntity.ok(sale);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize(AuthorizationRules.ADMIN_ONLY)
    public ResponseEntity<SaleResponse> cancelSale(
            @PathVariable Long id,
            @Valid @RequestBody SaleCancellationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(saleService.cancelSale(id, request, authentication.getName()));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}

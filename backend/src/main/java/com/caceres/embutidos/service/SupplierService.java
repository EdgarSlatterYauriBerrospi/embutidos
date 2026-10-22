package com.caceres.embutidos.service;

import java.util.List;

import com.caceres.embutidos.dto.SupplierRequest;
import com.caceres.embutidos.dto.SupplierResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public interface SupplierService {

    SupplierResponse createSupplier(@NotNull @Valid SupplierRequest request);

    SupplierResponse getSupplierById(Long id);

    List<SupplierResponse> getAllSuppliers();

    SupplierResponse updateSupplier(Long id, @NotNull @Valid SupplierRequest request);

    void deactivateSupplier(Long id);
}

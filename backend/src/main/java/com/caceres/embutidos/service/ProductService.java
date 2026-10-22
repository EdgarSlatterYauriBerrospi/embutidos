package com.caceres.embutidos.service;

import java.util.List;

import com.caceres.embutidos.dto.ProductRequest;
import com.caceres.embutidos.dto.ProductResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public interface ProductService {

    ProductResponse createProduct(@NotNull @Valid ProductRequest request);

    ProductResponse getProductById(Long id);

    List<ProductResponse> getAllProducts();

    ProductResponse updateProduct(Long id, @NotNull @Valid ProductRequest request);

    void deactivateProduct(Long id);
}

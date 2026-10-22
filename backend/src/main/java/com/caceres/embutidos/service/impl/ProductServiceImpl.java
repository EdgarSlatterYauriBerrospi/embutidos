package com.caceres.embutidos.service.impl;

import java.util.List;

import com.caceres.embutidos.dto.ProductRequest;
import com.caceres.embutidos.dto.ProductResponse;
import com.caceres.embutidos.entity.Product;
import com.caceres.embutidos.exception.ResourceNotFoundException;
import com.caceres.embutidos.repository.ProductRepository;
import com.caceres.embutidos.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        product.setStock(0);
        applyEditableFields(product, request);
        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return toResponse(findProduct(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findProduct(id);
        applyEditableFields(product, request);
        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deactivateProduct(Long id) {
        Product product = findProduct(id);
        product.setActive(false);
        productRepository.save(product);
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private void applyEditableFields(Product product, ProductRequest request) {
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setMinimumStock(request.minimumStock());
        product.setImageUrl(request.imageUrl());
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getMinimumStock(),
                product.getImageUrl(),
                product.isActive()
        );
    }
}

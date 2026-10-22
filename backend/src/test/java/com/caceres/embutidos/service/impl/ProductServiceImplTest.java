package com.caceres.embutidos.service.impl;

import java.math.BigDecimal;
import java.util.Optional;

import com.caceres.embutidos.dto.ProductRequest;
import com.caceres.embutidos.entity.Product;
import com.caceres.embutidos.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    @Test
    void createProductInitializesStockToZeroAndIgnoresRequestedStock() {
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = productService.createProduct(request(25));

        assertEquals(0, response.stock());
    }

    @Test
    void createProductAcceptsMissingStock() {
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = productService.createProduct(request(null));

        assertEquals(0, response.stock());
    }

    @Test
    void updateProductPreservesCurrentStock() {
        Product product = new Product();
        product.setId(1L);
        product.setStock(12);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = productService.updateProduct(1L, request(99));

        assertEquals(12, response.stock());
    }

    private ProductRequest request(Integer stock) {
        return new ProductRequest(
                "Salchicha",
                "Paquete de salchichas",
                new BigDecimal("12.50"),
                stock,
                5,
                null
        );
    }
}

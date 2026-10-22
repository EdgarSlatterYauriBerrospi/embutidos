package com.caceres.embutidos.service.impl;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import com.caceres.embutidos.dto.ProductBatchRequest;
import com.caceres.embutidos.dto.ProductBatchResponse;
import com.caceres.embutidos.entity.Product;
import com.caceres.embutidos.entity.ProductBatch;
import com.caceres.embutidos.exception.BusinessException;
import com.caceres.embutidos.exception.ResourceNotFoundException;
import com.caceres.embutidos.repository.ProductBatchRepository;
import com.caceres.embutidos.repository.ProductRepository;
import com.caceres.embutidos.service.ProductBatchService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class ProductBatchServiceImpl implements ProductBatchService {

    private final ProductBatchRepository productBatchRepository;
    private final ProductRepository productRepository;

    public ProductBatchServiceImpl(ProductBatchRepository productBatchRepository, ProductRepository productRepository) {
        this.productBatchRepository = productBatchRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public ProductBatchResponse createBatch(ProductBatchRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.productId()));

        ProductBatch batch = new ProductBatch();
        batch.setProduct(product);
        batch.setQuantity(request.quantity());
        batch.setExpirationDate(request.expirationDate());
        batch.setEntryDate(request.entryDate());
        batch.setPurchasePrice(request.purchasePrice());
        return toResponse(productBatchRepository.save(batch));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductBatchResponse getBatchById(Long id) {
        return toResponse(findBatch(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductBatchResponse> getAllBatches() {
        return productBatchRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductBatchResponse> getBatchesByProduct(Long productId) {
        return productBatchRepository.findAll().stream()
                .filter(batch -> productId.equals(batch.getProduct().getId()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductBatchResponse> getExpiringBatches(LocalDate fromDate, LocalDate toDate) {
        if (toDate.isBefore(fromDate)) {
            throw new BusinessException("toDate must not be before fromDate");
        }

        return productBatchRepository.findAll().stream()
                .filter(ProductBatch::isActive)
                .filter(batch -> batch.getQuantity() > 0)
                .filter(batch -> !batch.getExpirationDate().isBefore(fromDate)
                        && !batch.getExpirationDate().isAfter(toDate))
                .sorted(Comparator.comparing(ProductBatch::getExpirationDate))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deactivateBatch(Long id) {
        ProductBatch batch = findBatch(id);
        batch.setActive(false);
        productBatchRepository.save(batch);
    }

    private ProductBatch findBatch(Long id) {
        return productBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product batch not found with id: " + id));
    }

    private ProductBatchResponse toResponse(ProductBatch batch) {
        return new ProductBatchResponse(
                batch.getId(),
                batch.getProduct().getId(),
                batch.getQuantity(),
                batch.getExpirationDate(),
                batch.getEntryDate(),
                batch.getPurchasePrice(),
                batch.isActive()
        );
    }
}

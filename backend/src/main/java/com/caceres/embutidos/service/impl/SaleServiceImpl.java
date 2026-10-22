package com.caceres.embutidos.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.caceres.embutidos.dto.SaleLineRequest;
import com.caceres.embutidos.dto.SaleLineResponse;
import com.caceres.embutidos.dto.SaleCancellationRequest;
import com.caceres.embutidos.dto.SaleRequest;
import com.caceres.embutidos.dto.SaleResponse;
import com.caceres.embutidos.entity.NotificationType;
import com.caceres.embutidos.entity.Product;
import com.caceres.embutidos.entity.ProductBatch;
import com.caceres.embutidos.entity.Sale;
import com.caceres.embutidos.entity.SaleBatchAllocation;
import com.caceres.embutidos.entity.SaleDetail;
import com.caceres.embutidos.entity.SaleStatus;
import com.caceres.embutidos.entity.StockMovement;
import com.caceres.embutidos.entity.StockMovementType;
import com.caceres.embutidos.entity.User;
import com.caceres.embutidos.exception.BusinessException;
import com.caceres.embutidos.exception.ResourceNotFoundException;
import com.caceres.embutidos.repository.ProductBatchRepository;
import com.caceres.embutidos.repository.ProductRepository;
import com.caceres.embutidos.repository.SaleBatchAllocationRepository;
import com.caceres.embutidos.repository.SaleDetailRepository;
import com.caceres.embutidos.repository.SaleRepository;
import com.caceres.embutidos.repository.StockMovementRepository;
import com.caceres.embutidos.repository.UserRepository;
import com.caceres.embutidos.service.SaleService;
import com.caceres.embutidos.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final SaleDetailRepository saleDetailRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository productBatchRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SaleBatchAllocationRepository saleBatchAllocationRepository;
    private final NotificationService notificationService;

    public SaleServiceImpl(
            SaleRepository saleRepository,
            SaleDetailRepository saleDetailRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            ProductBatchRepository productBatchRepository,
            StockMovementRepository stockMovementRepository,
            SaleBatchAllocationRepository saleBatchAllocationRepository,
            NotificationService notificationService
    ) {
        this.saleRepository = saleRepository;
        this.saleDetailRepository = saleDetailRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productBatchRepository = productBatchRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.saleBatchAllocationRepository = saleBatchAllocationRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public SaleResponse createSale(SaleRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.userId()));
        LocalDateTime saleDate = LocalDateTime.now();

        Map<Long, Product> products = new LinkedHashMap<>();
        Map<Long, Integer> quantities = new LinkedHashMap<>();
        List<ResolvedLine> lines = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (SaleLineRequest item : request.lines()) {
            Product product = products.get(item.productId());
            if (product == null) {
                product = productRepository.findById(item.productId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + item.productId()));
                products.put(item.productId(), product);
            }

            quantities.merge(item.productId(), item.quantity(), Math::addExact);
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(item.quantity()));
            lines.add(new ResolvedLine(product, item, subtotal));
            total = total.add(subtotal);
        }

        Map<Long, List<ProductBatch>> batchesByProduct = availableBatches(products, saleDate.toLocalDate());
        for (Map.Entry<Long, Product> entry : products.entrySet()) {
            int requested = quantities.get(entry.getKey());
            long availableInBatches = batchesByProduct.getOrDefault(entry.getKey(), List.of()).stream()
                    .mapToLong(ProductBatch::getQuantity)
                    .sum();
            if (entry.getValue().getStock() < requested || availableInBatches < requested) {
                throw new BusinessException("Insufficient stock for product id: " + entry.getKey());
            }
        }

        Sale sale = new Sale();
        sale.setSaleDate(saleDate);
        sale.setTotal(total);
        sale.setPaymentMethod(request.paymentMethod());
        sale.setPaymentReference(request.paymentReference());
        sale.setRegisteredBy(user);
        sale.setStatus(SaleStatus.COMPLETED);
        sale = saleRepository.save(sale);

        List<SaleDetail> details = new ArrayList<>();
        for (ResolvedLine line : lines) {
            SaleDetail detail = new SaleDetail();
            detail.setSale(sale);
            detail.setProduct(line.product());
            detail.setQuantity(line.item().quantity());
            detail.setUnitPrice(line.product().getPrice());
            detail.setSubtotal(line.subtotal());
            details.add(saleDetailRepository.save(detail));
        }

        for (Map.Entry<Long, Product> entry : products.entrySet()) {
            int quantity = quantities.get(entry.getKey());
            deductFromBatches(sale, batchesByProduct.get(entry.getKey()), quantity);

            Product product = entry.getValue();
            product.setStock(product.getStock() - quantity);
            productRepository.save(product);

            StockMovement movement = new StockMovement();
            movement.setProduct(product);
            movement.setRegisteredBy(user);
            movement.setType(StockMovementType.SALE_OUT);
            movement.setQuantity(quantity);
            movement.setMovementDate(saleDate);
            movement.setReason("Sale #" + sale.getId());
            stockMovementRepository.save(movement);
        }

        return toResponse(sale, details);
    }

    @Override
    @Transactional(readOnly = true)
    public SaleResponse getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        return toResponse(sale, findDetails(id));
    }

    @Override
    @Transactional(readOnly = true)
    public SaleResponse getSaleByIdForUser(Long id, String userEmail) {
        Sale sale = saleRepository.findByIdAndRegisteredBy_EmailIgnoreCase(id, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        return toResponse(sale, findDetails(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SaleResponse> getAllSales() {
        return toResponses(saleRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SaleResponse> getSalesByUserEmail(String userEmail) {
        return toResponses(saleRepository.findAllByRegisteredBy_EmailIgnoreCaseOrderBySaleDateDesc(userEmail));
    }

    private List<SaleResponse> toResponses(List<Sale> sales) {
        if (sales.isEmpty()) {
            return List.of();
        }

        Map<Long, List<SaleDetail>> detailsBySale = saleDetailRepository.findAll().stream()
                .collect(Collectors.groupingBy(detail -> detail.getSale().getId()));
        return sales.stream()
                .map(sale -> toResponse(sale, detailsBySale.getOrDefault(sale.getId(), List.of())))
                .toList();
    }

    private List<SaleDetail> findDetails(Long saleId) {
        return saleDetailRepository.findAll().stream()
                .filter(detail -> saleId.equals(detail.getSale().getId()))
                .toList();
    }

    @Override
    @Transactional
    public SaleResponse cancelSale(Long id, SaleCancellationRequest request, String userEmail) {
        Sale sale = saleRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        if (effectiveStatus(sale) == SaleStatus.CANCELLED) {
            throw new BusinessException("Sale is already cancelled: " + id);
        }

        User cancelledBy = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        List<SaleBatchAllocation> allocations = saleBatchAllocationRepository.findBySaleId(id);
        if (allocations.isEmpty()) {
            throw new BusinessException(
                    "Sale cannot be cancelled because its batch allocation data is unavailable"
            );
        }

        LocalDateTime cancellationDate = LocalDateTime.now();
        Map<Long, Integer> restoredByProduct = new LinkedHashMap<>();
        Map<Long, Product> affectedProducts = new LinkedHashMap<>();
        for (SaleBatchAllocation allocation : allocations) {
            ProductBatch batch = allocation.getBatch();
            batch.setQuantity(Math.addExact(batch.getQuantity(), allocation.getQuantity()));
            productBatchRepository.save(batch);

            Product product = batch.getProduct();
            restoredByProduct.merge(product.getId(), allocation.getQuantity(), Math::addExact);
            affectedProducts.put(product.getId(), product);
        }

        for (Map.Entry<Long, Integer> restored : restoredByProduct.entrySet()) {
            Product product = affectedProducts.get(restored.getKey());
            product.setStock(Math.addExact(product.getStock(), restored.getValue()));
            productRepository.save(product);

            StockMovement movement = new StockMovement();
            movement.setProduct(product);
            movement.setRegisteredBy(cancelledBy);
            movement.setType(StockMovementType.SALE_CANCELLATION_IN);
            movement.setQuantity(restored.getValue());
            movement.setMovementDate(cancellationDate);
            movement.setReason("Cancellation of sale #" + id + ": " + request.reason().trim());
            stockMovementRepository.save(movement);
        }

        sale.setStatus(SaleStatus.CANCELLED);
        sale.setCancellationDate(cancellationDate);
        sale.setCancellationReason(request.reason().trim());
        sale.setCancelledBy(cancelledBy);
        sale = saleRepository.save(sale);

        notificationService.notifyActiveUsers(
                NotificationType.SALE_CANCELLED,
                "La venta #" + id + " fue anulada.",
                "/sales/" + id,
                "sale:" + id
        );

        List<SaleDetail> details = saleDetailRepository.findAll().stream()
                .filter(detail -> id.equals(detail.getSale().getId()))
                .toList();
        return toResponse(sale, details);
    }

    private Map<Long, List<ProductBatch>> availableBatches(Map<Long, Product> products, LocalDate saleDate) {
        Map<Long, List<ProductBatch>> result = new HashMap<>();
        for (ProductBatch batch : productBatchRepository.findAll()) {
            Long productId = batch.getProduct().getId();
            if (products.containsKey(productId)
                    && batch.isActive()
                    && batch.getQuantity() > 0
                    && !batch.getEntryDate().isAfter(saleDate)
                    && !batch.getExpirationDate().isBefore(saleDate)) {
                result.computeIfAbsent(productId, ignored -> new ArrayList<>()).add(batch);
            }
        }
        Comparator<ProductBatch> byExpiration = Comparator.comparing(ProductBatch::getExpirationDate)
                .thenComparing(ProductBatch::getId);
        result.values().forEach(batches -> batches.sort(byExpiration));
        return result;
    }

    private void deductFromBatches(Sale sale, List<ProductBatch> batches, int quantity) {
        int remaining = quantity;
        for (ProductBatch batch : batches) {
            int deducted = Math.min(remaining, batch.getQuantity());
            batch.setQuantity(batch.getQuantity() - deducted);
            productBatchRepository.save(batch);

            SaleBatchAllocation allocation = new SaleBatchAllocation();
            allocation.setSale(sale);
            allocation.setBatch(batch);
            allocation.setQuantity(deducted);
            saleBatchAllocationRepository.save(allocation);

            remaining -= deducted;
            if (remaining == 0) {
                break;
            }
        }
    }

    private SaleResponse toResponse(Sale sale, List<SaleDetail> details) {
        List<SaleLineResponse> lines = details.stream()
                .map(detail -> new SaleLineResponse(
                        detail.getId(),
                        detail.getProduct().getId(),
                        detail.getQuantity(),
                        detail.getUnitPrice(),
                        detail.getSubtotal()
                ))
                .toList();

        return new SaleResponse(
                sale.getId(),
                sale.getSaleDate(),
                sale.getTotal(),
                sale.getPaymentMethod(),
                sale.getPaymentReference(),
                sale.getRegisteredBy().getId(),
                lines,
                effectiveStatus(sale),
                sale.getCancellationDate(),
                sale.getCancellationReason(),
                sale.getCancelledBy() == null ? null : sale.getCancelledBy().getId()
        );
    }

    private SaleStatus effectiveStatus(Sale sale) {
        return sale.getStatus() == null ? SaleStatus.COMPLETED : sale.getStatus();
    }

    private record ResolvedLine(Product product, SaleLineRequest item, BigDecimal subtotal) {
    }
}

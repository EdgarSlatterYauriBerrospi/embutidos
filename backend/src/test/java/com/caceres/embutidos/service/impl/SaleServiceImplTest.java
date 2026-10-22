package com.caceres.embutidos.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.caceres.embutidos.dto.SaleLineRequest;
import com.caceres.embutidos.dto.SaleCancellationRequest;
import com.caceres.embutidos.dto.SaleRequest;
import com.caceres.embutidos.entity.PaymentMethod;
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
import com.caceres.embutidos.repository.ProductBatchRepository;
import com.caceres.embutidos.repository.ProductRepository;
import com.caceres.embutidos.repository.SaleDetailRepository;
import com.caceres.embutidos.repository.SaleRepository;
import com.caceres.embutidos.repository.SaleBatchAllocationRepository;
import com.caceres.embutidos.repository.StockMovementRepository;
import com.caceres.embutidos.repository.UserRepository;
import com.caceres.embutidos.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SaleServiceImplTest {

    @Mock SaleRepository saleRepository;
    @Mock SaleDetailRepository saleDetailRepository;
    @Mock UserRepository userRepository;
    @Mock ProductRepository productRepository;
    @Mock ProductBatchRepository productBatchRepository;
    @Mock StockMovementRepository stockMovementRepository;
    @Mock SaleBatchAllocationRepository saleBatchAllocationRepository;
    @Mock NotificationService notificationService;
    @InjectMocks SaleServiceImpl saleService;

    @Test
    void createSaleConsumesEarliestExpiringBatchFirst() {
        User user = user();
        Product product = product(8);
        ProductBatch later = batch(11L, product, 5, LocalDate.now().plusMonths(2));
        ProductBatch earlier = batch(10L, product, 3, LocalDate.now().plusMonths(1));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product));
        when(productBatchRepository.findAll()).thenReturn(List.of(later, earlier));
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> {
            Sale sale = invocation.getArgument(0);
            sale.setId(20L);
            return sale;
        });
        when(saleDetailRepository.save(any(SaleDetail.class))).thenAnswer(invocation -> {
            SaleDetail detail = invocation.getArgument(0);
            detail.setId(30L);
            return detail;
        });

        var response = saleService.createSale(request(4));

        assertEquals(0, earlier.getQuantity());
        assertEquals(4, later.getQuantity());
        assertEquals(4, product.getStock());
        assertEquals(new BigDecimal("40.00"), response.total());
        assertEquals(1, response.lines().size());
        assertEquals(new BigDecimal("40.00"), response.lines().getFirst().subtotal());

        ArgumentCaptor<StockMovement> movement = ArgumentCaptor.forClass(StockMovement.class);
        verify(stockMovementRepository).save(movement.capture());
        assertEquals(StockMovementType.SALE_OUT, movement.getValue().getType());
        assertEquals(4, movement.getValue().getQuantity());
        assertEquals(product, movement.getValue().getProduct());
    }

    @Test
    void createSaleRejectsStockHeldOnlyInExpiredBatches() {
        User user = user();
        Product product = product(10);
        ProductBatch expired = batch(10L, product, 10, LocalDate.now().minusDays(1));
        ProductBatch available = batch(11L, product, 2, LocalDate.now().plusMonths(1));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product));
        when(productBatchRepository.findAll()).thenReturn(List.of(expired, available));

        assertThrows(BusinessException.class, () -> saleService.createSale(request(3)));
        assertEquals(10, product.getStock());
        assertEquals(10, expired.getQuantity());
        assertEquals(2, available.getQuantity());
        verifyNoInteractions(saleRepository, saleDetailRepository, stockMovementRepository);
    }

    @Test
    void cancelSaleRestoresExactAllocatedBatchesAndCannotRunTwice() {
        User user = user();
        Product product = product(4);
        ProductBatch batch = batch(10L, product, 1, LocalDate.now().plusMonths(1));
        Sale sale = new Sale();
        sale.setId(20L);
        sale.setSaleDate(LocalDateTime.now().minusHours(1));
        sale.setTotal(new BigDecimal("40.00"));
        sale.setPaymentMethod(PaymentMethod.CASH);
        sale.setRegisteredBy(user);
        sale.setStatus(SaleStatus.COMPLETED);
        SaleBatchAllocation allocation = new SaleBatchAllocation();
        allocation.setSale(sale);
        allocation.setBatch(batch);
        allocation.setQuantity(4);

        when(saleRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(sale));
        when(userRepository.findByEmailIgnoreCase("admin@example.com")).thenReturn(Optional.of(user));
        when(saleBatchAllocationRepository.findBySaleId(20L)).thenReturn(List.of(allocation));
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(saleDetailRepository.findAll()).thenReturn(List.of());

        var response = saleService.cancelSale(
                20L,
                new SaleCancellationRequest("Error de registro"),
                "admin@example.com"
        );

        assertEquals(SaleStatus.CANCELLED, response.status());
        assertEquals(5, batch.getQuantity());
        assertEquals(8, product.getStock());

        ArgumentCaptor<StockMovement> movement = ArgumentCaptor.forClass(StockMovement.class);
        verify(stockMovementRepository).save(movement.capture());
        assertEquals(StockMovementType.SALE_CANCELLATION_IN, movement.getValue().getType());
        assertEquals(4, movement.getValue().getQuantity());

        assertThrows(
                BusinessException.class,
                () -> saleService.cancelSale(
                        20L,
                        new SaleCancellationRequest("Segundo intento"),
                        "admin@example.com"
                )
        );
        assertEquals(5, batch.getQuantity());
        assertEquals(8, product.getStock());
    }

    private static SaleRequest request(int quantity) {
        return new SaleRequest(1L, PaymentMethod.CASH, null, List.of(new SaleLineRequest(2L, quantity)));
    }

    private static User user() {
        User user = new User();
        user.setId(1L);
        return user;
    }

    private static Product product(int stock) {
        Product product = new Product();
        product.setId(2L);
        product.setPrice(new BigDecimal("10.00"));
        product.setStock(stock);
        return product;
    }

    private static ProductBatch batch(Long id, Product product, int quantity, LocalDate expirationDate) {
        ProductBatch batch = new ProductBatch();
        batch.setId(id);
        batch.setProduct(product);
        batch.setQuantity(quantity);
        batch.setEntryDate(LocalDate.now().minusDays(1));
        batch.setExpirationDate(expirationDate);
        return batch;
    }
}

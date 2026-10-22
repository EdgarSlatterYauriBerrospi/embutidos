package com.caceres.embutidos.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.caceres.embutidos.dto.PurchaseLineRequest;
import com.caceres.embutidos.dto.PurchaseLineResponse;
import com.caceres.embutidos.dto.PurchaseRequest;
import com.caceres.embutidos.dto.PurchaseResponse;
import com.caceres.embutidos.entity.Product;
import com.caceres.embutidos.entity.NotificationType;
import com.caceres.embutidos.entity.ProductBatch;
import com.caceres.embutidos.entity.Purchase;
import com.caceres.embutidos.entity.PurchaseDetail;
import com.caceres.embutidos.entity.StockMovement;
import com.caceres.embutidos.entity.StockMovementType;
import com.caceres.embutidos.entity.Supplier;
import com.caceres.embutidos.entity.User;
import com.caceres.embutidos.exception.ResourceNotFoundException;
import com.caceres.embutidos.repository.ProductBatchRepository;
import com.caceres.embutidos.repository.ProductRepository;
import com.caceres.embutidos.repository.PurchaseDetailRepository;
import com.caceres.embutidos.repository.PurchaseRepository;
import com.caceres.embutidos.repository.StockMovementRepository;
import com.caceres.embutidos.repository.SupplierRepository;
import com.caceres.embutidos.repository.UserRepository;
import com.caceres.embutidos.service.PurchaseService;
import com.caceres.embutidos.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final PurchaseDetailRepository purchaseDetailRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository productBatchRepository;
    private final StockMovementRepository stockMovementRepository;
    private final NotificationService notificationService;

    public PurchaseServiceImpl(
            PurchaseRepository purchaseRepository,
            PurchaseDetailRepository purchaseDetailRepository,
            SupplierRepository supplierRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            ProductBatchRepository productBatchRepository,
            StockMovementRepository stockMovementRepository,
            NotificationService notificationService
    ) {
        this.purchaseRepository = purchaseRepository;
        this.purchaseDetailRepository = purchaseDetailRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productBatchRepository = productBatchRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public PurchaseResponse createPurchase(PurchaseRequest request) {
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.supplierId()));
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.userId()));

        List<ResolvedLine> lines = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseLineRequest item : request.lines()) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + item.productId()));
            BigDecimal subtotal = item.unitCost().multiply(BigDecimal.valueOf(item.quantity()));
            lines.add(new ResolvedLine(product, item, subtotal));
            total = total.add(subtotal);
        }

        Purchase purchase = new Purchase();
        purchase.setPurchaseDate(LocalDateTime.now());
        purchase.setTotal(total);
        purchase.setInvoiceNumber(request.invoiceNumber());
        purchase.setSupplier(supplier);
        purchase.setRegisteredBy(user);
        purchase = purchaseRepository.save(purchase);

        List<PurchaseDetail> details = new ArrayList<>();
        for (ResolvedLine line : lines) {
            PurchaseDetail detail = new PurchaseDetail();
            detail.setPurchase(purchase);
            detail.setProduct(line.product());
            detail.setQuantity(line.item().quantity());
            detail.setUnitCost(line.item().unitCost());
            detail.setSubtotal(line.subtotal());
            details.add(purchaseDetailRepository.save(detail));

            ProductBatch batch = new ProductBatch();
            batch.setProduct(line.product());
            batch.setQuantity(line.item().quantity());
            batch.setEntryDate(line.item().entryDate());
            batch.setExpirationDate(line.item().expirationDate());
            batch.setPurchasePrice(line.item().unitCost());
            productBatchRepository.save(batch);

            Product product = line.product();
            product.setStock(Math.addExact(product.getStock(), line.item().quantity()));
            productRepository.save(product);

            StockMovement movement = new StockMovement();
            movement.setQuantity(line.item().quantity());
            movement.setProduct(product);
            movement.setRegisteredBy(user);
            movement.setMovementDate(purchase.getPurchaseDate());
            movement.setType(StockMovementType.PURCHASE_IN);
            stockMovementRepository.save(movement);
        }

        notificationService.notifyAdmins(
                NotificationType.PURCHASE_REGISTERED,
                "Se registró un nuevo ingreso de mercadería.",
                "/purchases/" + purchase.getId(),
                "purchase:" + purchase.getId()
        );

        return toResponse(purchase, details);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
        List<PurchaseDetail> details = purchaseDetailRepository.findAll().stream()
                .filter(detail -> id.equals(detail.getPurchase().getId()))
                .toList();
        return toResponse(purchase, details);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseResponse> getAllPurchases() {
        List<Purchase> purchases = purchaseRepository.findAll();
        if (purchases.isEmpty()) {
            return List.of();
        }

        Map<Long, List<PurchaseDetail>> detailsByPurchase = purchaseDetailRepository.findAll().stream()
                .collect(Collectors.groupingBy(detail -> detail.getPurchase().getId()));
        return purchases.stream()
                .map(purchase -> toResponse(purchase, detailsByPurchase.getOrDefault(purchase.getId(), List.of())))
                .toList();
    }

    private PurchaseResponse toResponse(Purchase purchase, List<PurchaseDetail> details) {
        List<PurchaseLineResponse> lines = details.stream()
                .map(detail -> new PurchaseLineResponse(
                        detail.getId(),
                        detail.getProduct().getId(),
                        detail.getQuantity(),
                        detail.getUnitCost(),
                        detail.getSubtotal()
                ))
                .toList();

        return new PurchaseResponse(
                purchase.getId(),
                purchase.getPurchaseDate(),
                purchase.getTotal(),
                purchase.getInvoiceNumber(),
                purchase.getSupplier().getId(),
                purchase.getRegisteredBy().getId(),
                lines
        );
    }

    private record ResolvedLine(Product product, PurchaseLineRequest item, BigDecimal subtotal) {
    }
}

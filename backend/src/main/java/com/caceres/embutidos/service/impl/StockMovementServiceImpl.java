package com.caceres.embutidos.service.impl;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import com.caceres.embutidos.dto.StockMovementRequest;
import com.caceres.embutidos.dto.StockMovementResponse;
import com.caceres.embutidos.entity.Product;
import com.caceres.embutidos.entity.NotificationType;
import com.caceres.embutidos.entity.StockMovement;
import com.caceres.embutidos.entity.StockMovementType;
import com.caceres.embutidos.entity.User;
import com.caceres.embutidos.exception.BusinessException;
import com.caceres.embutidos.exception.ResourceNotFoundException;
import com.caceres.embutidos.repository.ProductRepository;
import com.caceres.embutidos.repository.StockMovementRepository;
import com.caceres.embutidos.repository.UserRepository;
import com.caceres.embutidos.service.StockMovementService;
import com.caceres.embutidos.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class StockMovementServiceImpl implements StockMovementService {

    private static final Set<StockMovementType> MANUAL_TYPES = EnumSet.of(
            StockMovementType.ADJUSTMENT_IN,
            StockMovementType.ADJUSTMENT_OUT,
            StockMovementType.EXPIRED_OUT
    );

    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public StockMovementServiceImpl(
            StockMovementRepository stockMovementRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.stockMovementRepository = stockMovementRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementResponse> getAllMovements() {
        return stockMovementRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementResponse> getMovementsByProduct(Long productId) {
        return stockMovementRepository.findAll().stream()
                .filter(movement -> productId.equals(movement.getProduct().getId()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public StockMovementResponse createManualAdjustment(StockMovementRequest request) {
        if (!MANUAL_TYPES.contains(request.type())) {
            throw new BusinessException("Movement type is not allowed for a manual adjustment: " + request.type());
        }

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.productId()));
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.userId()));

        updateStock(product, request.quantity(), request.type());
        productRepository.save(product);

        StockMovement movement = new StockMovement();
        movement.setQuantity(request.quantity());
        movement.setMovementDate(LocalDateTime.now());
        movement.setReason(request.reason());
        movement.setType(request.type());
        movement.setProduct(product);
        movement.setRegisteredBy(user);
        movement = stockMovementRepository.save(movement);
        notificationService.notifyActiveUsers(
                NotificationType.STOCK_ADJUSTMENT,
                "Se registró un ajuste de stock para " + product.getName() + ".",
                "/stock/" + product.getId(),
                "movement:" + movement.getId()
        );
        return toResponse(movement);
    }

    private void updateStock(Product product, int quantity, StockMovementType type) {
        if (type == StockMovementType.ADJUSTMENT_IN) {
            product.setStock(Math.addExact(product.getStock(), quantity));
            return;
        }

        if (product.getStock() < quantity) {
            throw new BusinessException("Insufficient stock for product id: " + product.getId());
        }
        product.setStock(product.getStock() - quantity);
    }

    private StockMovementResponse toResponse(StockMovement movement) {
        return new StockMovementResponse(
                movement.getId(),
                movement.getQuantity(),
                movement.getMovementDate(),
                movement.getReason(),
                movement.getType(),
                movement.getProduct().getId(),
                movement.getRegisteredBy().getId()
        );
    }
}

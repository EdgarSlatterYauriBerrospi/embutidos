package com.caceres.embutidos.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.caceres.embutidos.dto.NotificationResponse;
import com.caceres.embutidos.entity.Notification;
import com.caceres.embutidos.entity.NotificationType;
import com.caceres.embutidos.entity.Product;
import com.caceres.embutidos.entity.ProductBatch;
import com.caceres.embutidos.entity.Role;
import com.caceres.embutidos.entity.User;
import com.caceres.embutidos.exception.ResourceNotFoundException;
import com.caceres.embutidos.repository.NotificationRepository;
import com.caceres.embutidos.repository.ProductBatchRepository;
import com.caceres.embutidos.repository.ProductRepository;
import com.caceres.embutidos.repository.UserRepository;
import com.caceres.embutidos.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository productBatchRepository;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            ProductBatchRepository productBatchRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productBatchRepository = productBatchRepository;
    }

    @Override
    @Transactional
    public List<NotificationResponse> getNotifications(String userEmail) {
        User user = requireActiveUser(userEmail);
        synchronizeOperationalAlerts(user);
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public long getUnreadCount(String userEmail) {
        User user = requireActiveUser(userEmail);
        synchronizeOperationalAlerts(user);
        return notificationRepository.countByRecipientIdAndReadFalse(user.getId());
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, String userEmail) {
        User user = requireActiveUser(userEmail);
        Notification notification = notificationRepository
                .findByIdAndRecipientId(notificationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found with id: " + notificationId
                ));
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = requireActiveUser(userEmail);
        List<Notification> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(user.getId());
        notifications.stream()
                .filter(notification -> !notification.isRead())
                .forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    @Transactional
    public void notifyActiveUsers(
            NotificationType type,
            String message,
            String targetPath,
            String eventKey
    ) {
        userRepository.findAll().stream()
                .filter(User::isActive)
                .forEach(user -> createIfMissing(
                        user,
                        type,
                        message,
                        targetPath,
                        type.name() + ":" + eventKey
                ));
    }

    @Override
    @Transactional
    public void notifyAdmins(
            NotificationType type,
            String message,
            String targetPath,
            String eventKey
    ) {
        userRepository.findAll().stream()
                .filter(User::isActive)
                .filter(user -> Role.ADMIN.equals(user.getRole().getName()))
                .forEach(user -> createIfMissing(
                        user,
                        type,
                        message,
                        targetPath,
                        type.name() + ":" + eventKey
                ));
    }

    private void synchronizeOperationalAlerts(User user) {
        productRepository.findAll().stream()
                .filter(Product::isActive)
                .filter(product -> product.getStock() <= product.getMinimumStock())
                .forEach(product -> createIfMissing(
                        user,
                        NotificationType.LOW_STOCK,
                        product.getName() + " tiene stock bajo (" + product.getStock() + ").",
                        "/stock/" + product.getId(),
                        "LOW_STOCK:product:" + product.getId() + ":stock:" + product.getStock()
                ));

        LocalDate today = LocalDate.now();
        productBatchRepository.findAll().stream()
                .filter(ProductBatch::isActive)
                .filter(batch -> batch.getQuantity() > 0)
                .forEach(batch -> synchronizeBatchAlert(user, batch, today));
    }

    private void synchronizeBatchAlert(User user, ProductBatch batch, LocalDate today) {
        long days = ChronoUnit.DAYS.between(today, batch.getExpirationDate());
        if (days < 0) {
            createIfMissing(
                    user,
                    NotificationType.EXPIRED_BATCH,
                    "El lote #" + batch.getId() + " de " + batch.getProduct().getName() + " está vencido.",
                    "/stock/" + batch.getProduct().getId(),
                    "EXPIRED_BATCH:batch:" + batch.getId()
            );
        } else if (days <= 30) {
            createIfMissing(
                    user,
                    NotificationType.EXPIRING_BATCH,
                    "El lote #" + batch.getId() + " de " + batch.getProduct().getName()
                            + " vence en " + days + (days == 1 ? " día." : " días."),
                    "/stock/" + batch.getProduct().getId(),
                    "EXPIRING_BATCH:batch:" + batch.getId()
            );
        }
    }

    private void createIfMissing(
            User recipient,
            NotificationType type,
            String message,
            String targetPath,
            String deduplicationKey
    ) {
        if (notificationRepository.existsByRecipientIdAndDeduplicationKey(
                recipient.getId(),
                deduplicationKey
        )) {
            return;
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setMessage(message);
        notification.setTargetPath(targetPath);
        notification.setDeduplicationKey(deduplicationKey);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    private User requireActiveUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        if (!user.isActive()) {
            throw new ResourceNotFoundException("Active user not found: " + email);
        }
        return user;
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.getCreatedAt(),
                notification.isRead(),
                notification.getTargetPath()
        );
    }
}

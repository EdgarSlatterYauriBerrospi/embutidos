package com.caceres.embutidos.repository;

import java.util.List;
import java.util.Optional;

import com.caceres.embutidos.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);

    boolean existsByRecipientIdAndDeduplicationKey(Long recipientId, String deduplicationKey);

    long countByRecipientIdAndReadFalse(Long recipientId);
}

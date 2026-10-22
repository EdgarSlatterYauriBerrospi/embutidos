package com.caceres.embutidos.dto;

import java.time.LocalDateTime;

import com.caceres.embutidos.entity.NotificationType;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String message,
        LocalDateTime createdAt,
        boolean read,
        String targetPath
) {
}

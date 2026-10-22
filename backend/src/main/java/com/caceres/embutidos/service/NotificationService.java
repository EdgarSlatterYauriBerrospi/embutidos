package com.caceres.embutidos.service;

import java.util.List;

import com.caceres.embutidos.dto.NotificationResponse;
import com.caceres.embutidos.entity.NotificationType;

public interface NotificationService {

    List<NotificationResponse> getNotifications(String userEmail);

    long getUnreadCount(String userEmail);

    NotificationResponse markAsRead(Long notificationId, String userEmail);

    void markAllAsRead(String userEmail);

    void notifyActiveUsers(NotificationType type, String message, String targetPath, String eventKey);

    void notifyAdmins(NotificationType type, String message, String targetPath, String eventKey);
}

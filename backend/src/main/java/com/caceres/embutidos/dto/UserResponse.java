package com.caceres.embutidos.dto;

public record UserResponse(
        Long id,
        String name,
        String email,
        boolean active,
        Long roleId,
        String roleName
) {
}

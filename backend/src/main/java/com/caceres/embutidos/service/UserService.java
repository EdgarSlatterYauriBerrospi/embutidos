package com.caceres.embutidos.service;

import java.util.List;

import com.caceres.embutidos.dto.UserRequest;
import com.caceres.embutidos.dto.UserResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public interface UserService {

    UserResponse createUser(@NotNull @Valid UserRequest request);

    UserResponse getUserById(Long id);

    List<UserResponse> getAllUsers();

    UserResponse updateUser(Long id, @NotNull @Valid UserRequest request);

    void deactivateUser(Long id);
}

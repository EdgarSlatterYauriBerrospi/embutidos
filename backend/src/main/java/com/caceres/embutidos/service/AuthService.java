package com.caceres.embutidos.service;

import com.caceres.embutidos.dto.LoginRequest;
import com.caceres.embutidos.dto.LoginResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public interface AuthService {

    LoginResponse login(@NotNull @Valid LoginRequest request);
}

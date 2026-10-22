package com.caceres.embutidos.service.impl;

import java.util.List;
import java.util.Locale;

import com.caceres.embutidos.dto.UserRequest;
import com.caceres.embutidos.dto.UserResponse;
import com.caceres.embutidos.entity.Role;
import com.caceres.embutidos.entity.User;
import com.caceres.embutidos.exception.BusinessException;
import com.caceres.embutidos.exception.ResourceNotFoundException;
import com.caceres.embutidos.repository.RoleRepository;
import com.caceres.embutidos.repository.UserRepository;
import com.caceres.embutidos.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        User user = new User();
        applyRequest(user, request);
        user.setPassword(encodePassword(request.password()));
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return toResponse(findUser(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = findUser(id);
        applyRequest(user, request);
        if (request.password() != null) {
            user.setPassword(encodePassword(request.password()));
        }
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {
        User user = findUser(id);
        user.setActive(false);
        userRepository.save(user);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private Role findRole(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new BusinessException("Role is not configured: " + roleName));
    }

    private void applyRequest(User user, UserRequest request) {
        user.setName(request.name());
        user.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        user.setRole(findRole(request.role()));
    }

    private String encodePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new BusinessException("Password must not be blank");
        }
        return passwordEncoder.encode(password);
    }

    private UserResponse toResponse(User user) {
        Role role = user.getRole();
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.isActive(),
                role.getId(),
                role.getName()
        );
    }
}

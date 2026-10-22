package com.caceres.embutidos.config;

import com.caceres.embutidos.entity.Role;
import com.caceres.embutidos.entity.User;
import com.caceres.embutidos.repository.RoleRepository;
import com.caceres.embutidos.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminInitializer implements CommandLineRunner {

    private static final String ADMIN_NAME = "Ernesto";
    private static final String ADMIN_EMAIL = "admin.ernesto@gmail.com";
    private static final String DEVELOPMENT_PASSWORD = "admin2027";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(
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
    public void run(String... args) {
        if (userRepository.findByEmailIgnoreCase(ADMIN_EMAIL).isPresent()) {
            return;
        }

        Role adminRole = roleRepository.findAll().stream()
                .filter(role -> Role.ADMIN.equals(role.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("ADMIN role is required to create the initial admin user"));

        User admin = new User();
        admin.setName(ADMIN_NAME);
        admin.setEmail(ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode(DEVELOPMENT_PASSWORD));
        admin.setRole(adminRole);
        admin.setActive(true);
        userRepository.save(admin);
    }
}

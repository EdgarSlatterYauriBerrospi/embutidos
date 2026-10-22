package com.caceres.embutidos.repository;

import java.util.Optional;

import com.caceres.embutidos.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);
}

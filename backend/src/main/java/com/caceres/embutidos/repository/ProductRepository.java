package com.caceres.embutidos.repository;

import com.caceres.embutidos.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}

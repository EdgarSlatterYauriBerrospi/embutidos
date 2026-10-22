package com.caceres.embutidos.repository;

import com.caceres.embutidos.entity.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {

    @Query("""
            select batch from ProductBatch batch
            join fetch batch.product
            where batch.active = true
              and batch.quantity > 0
              and (:fromDate is null or batch.expirationDate >= :fromDate)
              and (:toDate is null or batch.expirationDate <= :toDate)
            order by batch.expirationDate, batch.product.name
            """)
    List<ProductBatch> findExpirationsForReport(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );
}

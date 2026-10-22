package com.caceres.embutidos.repository;

import com.caceres.embutidos.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("""
            select movement from StockMovement movement
            join fetch movement.product
            join fetch movement.registeredBy
            where (:fromDateTime is null or movement.movementDate >= :fromDateTime)
              and (:toDateTime is null or movement.movementDate < :toDateTime)
            order by movement.movementDate
            """)
    List<StockMovement> findForReport(
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime
    );
}

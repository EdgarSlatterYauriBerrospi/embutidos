package com.caceres.embutidos.repository;

import com.caceres.embutidos.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    @Query("""
            select purchase from Purchase purchase
            join fetch purchase.supplier
            join fetch purchase.registeredBy
            where (:fromDateTime is null or purchase.purchaseDate >= :fromDateTime)
              and (:toDateTime is null or purchase.purchaseDate < :toDateTime)
            order by purchase.purchaseDate
            """)
    List<Purchase> findForReport(
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime
    );
}

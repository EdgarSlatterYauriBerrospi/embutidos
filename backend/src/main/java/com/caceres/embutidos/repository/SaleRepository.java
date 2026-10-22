package com.caceres.embutidos.repository;

import com.caceres.embutidos.entity.Sale;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select sale from Sale sale where sale.id = :id")
    Optional<Sale> findByIdForUpdate(@Param("id") Long id);

    Optional<Sale> findByIdAndRegisteredBy_EmailIgnoreCase(Long id, String email);

    List<Sale> findAllByRegisteredBy_EmailIgnoreCaseOrderBySaleDateDesc(String email);

    @Query("""
            select sale from Sale sale
            join fetch sale.registeredBy
            where (:fromDateTime is null or sale.saleDate >= :fromDateTime)
              and (:toDateTime is null or sale.saleDate < :toDateTime)
            order by sale.saleDate
            """)
    List<Sale> findForReport(
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime
    );
}

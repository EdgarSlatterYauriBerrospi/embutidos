package com.caceres.embutidos.repository;

import com.caceres.embutidos.entity.PurchaseDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PurchaseDetailRepository extends JpaRepository<PurchaseDetail, Long> {

    @Query("""
            select detail from PurchaseDetail detail
            join fetch detail.product
            where detail.purchase.id in :purchaseIds
            order by detail.purchase.purchaseDate, detail.id
            """)
    List<PurchaseDetail> findForReport(@Param("purchaseIds") Collection<Long> purchaseIds);
}

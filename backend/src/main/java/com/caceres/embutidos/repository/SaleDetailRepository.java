package com.caceres.embutidos.repository;

import com.caceres.embutidos.entity.SaleDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface SaleDetailRepository extends JpaRepository<SaleDetail, Long> {

    @Query("""
            select detail from SaleDetail detail
            join fetch detail.product
            where detail.sale.id in :saleIds
            order by detail.sale.saleDate, detail.id
            """)
    List<SaleDetail> findForReport(@Param("saleIds") Collection<Long> saleIds);
}

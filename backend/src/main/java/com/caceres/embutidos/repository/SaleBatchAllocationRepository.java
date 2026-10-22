package com.caceres.embutidos.repository;

import java.util.List;

import com.caceres.embutidos.entity.SaleBatchAllocation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleBatchAllocationRepository extends JpaRepository<SaleBatchAllocation, Long> {

    List<SaleBatchAllocation> findBySaleId(Long saleId);
}

package com.caceres.embutidos.service;

import java.time.LocalDate;

public interface ReportService {

    byte[] generateSalesPdf(LocalDate fromDate, LocalDate toDate);

    byte[] generateStockPdf();

    byte[] generateExpirationsPdf(LocalDate fromDate, LocalDate toDate);

    byte[] generatePurchasesPdf(LocalDate fromDate, LocalDate toDate);

    byte[] generateStockMovementsPdf(LocalDate fromDate, LocalDate toDate);
}

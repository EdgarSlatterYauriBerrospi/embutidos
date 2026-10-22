package com.caceres.embutidos.service.impl;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import com.caceres.embutidos.exception.BusinessException;
import com.caceres.embutidos.repository.ProductBatchRepository;
import com.caceres.embutidos.repository.ProductRepository;
import com.caceres.embutidos.repository.PurchaseDetailRepository;
import com.caceres.embutidos.repository.PurchaseRepository;
import com.caceres.embutidos.repository.SaleDetailRepository;
import com.caceres.embutidos.repository.SaleRepository;
import com.caceres.embutidos.repository.StockMovementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock SaleRepository saleRepository;
    @Mock SaleDetailRepository saleDetailRepository;
    @Mock ProductRepository productRepository;
    @Mock ProductBatchRepository productBatchRepository;
    @Mock PurchaseRepository purchaseRepository;
    @Mock PurchaseDetailRepository purchaseDetailRepository;
    @Mock StockMovementRepository stockMovementRepository;
    @InjectMocks ReportServiceImpl reportService;

    @Test
    void generatesValidPdfForEveryReportWhenThereAreNoRecords() {
        when(saleRepository.findForReport(null, null)).thenReturn(List.of());
        when(productRepository.findAll(any(Sort.class))).thenReturn(List.of());
        when(productBatchRepository.findExpirationsForReport(null, null)).thenReturn(List.of());
        when(purchaseRepository.findForReport(null, null)).thenReturn(List.of());
        when(stockMovementRepository.findForReport(null, null)).thenReturn(List.of());

        assertPdf(reportService.generateSalesPdf(null, null));
        assertPdf(reportService.generateStockPdf());
        assertPdf(reportService.generateExpirationsPdf(null, null));
        assertPdf(reportService.generatePurchasesPdf(null, null));
        assertPdf(reportService.generateStockMovementsPdf(null, null));
    }

    @Test
    void rejectsAnInvertedDateRange() {
        LocalDate fromDate = LocalDate.of(2026, 9, 30);
        LocalDate toDate = fromDate.minusDays(1);

        assertThrows(BusinessException.class, () -> reportService.generateSalesPdf(fromDate, toDate));
    }

    private void assertPdf(byte[] content) {
        assertTrue(content.length > 100);
        assertTrue(new String(content, 0, 4, StandardCharsets.US_ASCII).startsWith("%PDF"));
    }
}

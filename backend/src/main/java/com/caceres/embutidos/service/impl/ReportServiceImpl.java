package com.caceres.embutidos.service.impl;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import com.caceres.embutidos.entity.Product;
import com.caceres.embutidos.entity.ProductBatch;
import com.caceres.embutidos.entity.Purchase;
import com.caceres.embutidos.entity.PurchaseDetail;
import com.caceres.embutidos.entity.Sale;
import com.caceres.embutidos.entity.SaleDetail;
import com.caceres.embutidos.entity.StockMovement;
import com.caceres.embutidos.exception.BusinessException;
import com.caceres.embutidos.repository.ProductBatchRepository;
import com.caceres.embutidos.repository.ProductRepository;
import com.caceres.embutidos.repository.PurchaseDetailRepository;
import com.caceres.embutidos.repository.PurchaseRepository;
import com.caceres.embutidos.repository.SaleDetailRepository;
import com.caceres.embutidos.repository.SaleRepository;
import com.caceres.embutidos.repository.StockMovementRepository;
import com.caceres.embutidos.service.ReportService;
import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.Element;
import org.openpdf.text.Font;
import org.openpdf.text.FontFactory;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.Phrase;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportServiceImpl implements ReportService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Font BRAND_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 17, new Color(115, 36, 31));
    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Color.DARK_GRAY);
    private static final Font META_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
    private static final Font HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
    private static final Font CELL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);
    private static final Font SUMMARY_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.DARK_GRAY);
    private static final Color TABLE_HEADER_COLOR = new Color(115, 36, 31);
    private static final Color ALTERNATE_ROW_COLOR = new Color(247, 242, 238);

    private final SaleRepository saleRepository;
    private final SaleDetailRepository saleDetailRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository productBatchRepository;
    private final PurchaseRepository purchaseRepository;
    private final PurchaseDetailRepository purchaseDetailRepository;
    private final StockMovementRepository stockMovementRepository;

    public ReportServiceImpl(
            SaleRepository saleRepository,
            SaleDetailRepository saleDetailRepository,
            ProductRepository productRepository,
            ProductBatchRepository productBatchRepository,
            PurchaseRepository purchaseRepository,
            PurchaseDetailRepository purchaseDetailRepository,
            StockMovementRepository stockMovementRepository
    ) {
        this.saleRepository = saleRepository;
        this.saleDetailRepository = saleDetailRepository;
        this.productRepository = productRepository;
        this.productBatchRepository = productBatchRepository;
        this.purchaseRepository = purchaseRepository;
        this.purchaseDetailRepository = purchaseDetailRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateSalesPdf(LocalDate fromDate, LocalDate toDate) {
        DateRange range = dateRange(fromDate, toDate);
        List<Sale> sales = saleRepository.findForReport(range.fromDateTime(), range.toDateTimeExclusive());
        List<Long> saleIds = sales.stream().map(Sale::getId).toList();
        List<SaleDetail> details = saleIds.isEmpty() ? List.of() : saleDetailRepository.findForReport(saleIds);
        List<List<String>> rows = new ArrayList<>();

        for (SaleDetail detail : details) {
            Sale sale = detail.getSale();
            rows.add(List.of(
                    formatDateTime(sale.getSaleDate()),
                    safe(sale.getRegisteredBy().getName()),
                    safe(detail.getProduct().getName()),
                    String.valueOf(detail.getQuantity()),
                    money(detail.getUnitPrice()),
                    money(detail.getSubtotal()),
                    displayName(sale.getPaymentMethod()),
                    displayName(sale.getStatus())
            ));
        }

        BigDecimal total = sales.stream().map(Sale::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        String summary = "Sales: " + sales.size() + "   Total: " + money(total);
        return createPdf(
                "Sales report",
                range.label(),
                new String[]{"Date", "Registered by", "Product", "Qty", "Unit price", "Subtotal", "Payment", "Status"},
                new float[]{1.25f, 1.15f, 1.65f, 0.55f, 0.85f, 0.9f, 0.85f, 0.8f},
                rows,
                summary
        );
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateStockPdf() {
        List<Product> products = productRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
        List<List<String>> rows = products.stream()
                .map(product -> List.of(
                        safe(product.getName()),
                        money(product.getPrice()),
                        String.valueOf(product.getStock()),
                        String.valueOf(product.getMinimumStock()),
                        product.getStock() <= product.getMinimumStock() ? "Low stock" : "Available",
                        product.isActive() ? "Active" : "Inactive"
                ))
                .toList();

        int totalUnits = products.stream().mapToInt(Product::getStock).sum();
        String summary = "Products: " + products.size() + "   Units in stock: " + totalUnits;
        return createPdf(
                "Stock report",
                "Current inventory snapshot",
                new String[]{"Product", "Sale price", "Stock", "Minimum", "Availability", "State"},
                new float[]{2.2f, 1f, 0.75f, 0.8f, 1.1f, 0.9f},
                rows,
                summary
        );
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateExpirationsPdf(LocalDate fromDate, LocalDate toDate) {
        DateRange range = dateRange(fromDate, toDate);
        List<ProductBatch> batches = productBatchRepository.findExpirationsForReport(fromDate, toDate);
        LocalDate today = LocalDate.now();
        List<List<String>> rows = batches.stream()
                .map(batch -> List.of(
                        safe(batch.getProduct().getName()),
                        formatDate(batch.getEntryDate()),
                        formatDate(batch.getExpirationDate()),
                        String.valueOf(ChronoUnit.DAYS.between(today, batch.getExpirationDate())),
                        String.valueOf(batch.getQuantity()),
                        money(batch.getPurchasePrice())
                ))
                .toList();

        int totalUnits = batches.stream().mapToInt(ProductBatch::getQuantity).sum();
        String summary = "Batches: " + batches.size() + "   Units: " + totalUnits;
        return createPdf(
                "Expirations report",
                range.label(),
                new String[]{"Product", "Entry date", "Expiration", "Days", "Quantity", "Purchase price"},
                new float[]{2.1f, 1f, 1f, 0.65f, 0.8f, 1.1f},
                rows,
                summary
        );
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generatePurchasesPdf(LocalDate fromDate, LocalDate toDate) {
        DateRange range = dateRange(fromDate, toDate);
        List<Purchase> purchases = purchaseRepository.findForReport(range.fromDateTime(), range.toDateTimeExclusive());
        List<Long> purchaseIds = purchases.stream().map(Purchase::getId).toList();
        List<PurchaseDetail> details = purchaseIds.isEmpty()
                ? List.of()
                : purchaseDetailRepository.findForReport(purchaseIds);
        List<List<String>> rows = new ArrayList<>();

        for (PurchaseDetail detail : details) {
            Purchase purchase = detail.getPurchase();
            rows.add(List.of(
                    formatDateTime(purchase.getPurchaseDate()),
                    safe(purchase.getSupplier().getName()),
                    safe(purchase.getInvoiceNumber()),
                    safe(purchase.getRegisteredBy().getName()),
                    safe(detail.getProduct().getName()),
                    String.valueOf(detail.getQuantity()),
                    money(detail.getUnitCost()),
                    money(detail.getSubtotal())
            ));
        }

        BigDecimal total = purchases.stream().map(Purchase::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        String summary = "Purchases: " + purchases.size() + "   Total: " + money(total);
        return createPdf(
                "Purchases report",
                range.label(),
                new String[]{"Date", "Supplier", "Invoice", "Registered by", "Product", "Qty", "Unit cost", "Subtotal"},
                new float[]{1.15f, 1.3f, 0.9f, 1.1f, 1.45f, 0.5f, 0.85f, 0.85f},
                rows,
                summary
        );
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateStockMovementsPdf(LocalDate fromDate, LocalDate toDate) {
        DateRange range = dateRange(fromDate, toDate);
        List<StockMovement> movements = stockMovementRepository.findForReport(
                range.fromDateTime(),
                range.toDateTimeExclusive()
        );
        List<List<String>> rows = movements.stream()
                .map(movement -> List.of(
                        formatDateTime(movement.getMovementDate()),
                        safe(movement.getProduct().getName()),
                        displayName(movement.getType()),
                        String.valueOf(movement.getQuantity()),
                        safe(movement.getRegisteredBy().getName()),
                        safe(movement.getReason())
                ))
                .toList();

        String summary = "Movements: " + movements.size();
        return createPdf(
                "Stock movements report",
                range.label(),
                new String[]{"Date", "Product", "Type", "Quantity", "Registered by", "Reason"},
                new float[]{1.2f, 1.6f, 1.15f, 0.7f, 1.15f, 2f},
                rows,
                summary
        );
    }

    private byte[] createPdf(
            String title,
            String period,
            String[] headers,
            float[] widths,
            List<List<String>> rows,
            String summary
    ) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 28, 28, 28, 28);
            PdfWriter.getInstance(document, output);
            document.addTitle(title);
            document.addAuthor("Embutidos Cáceres");
            document.open();

            document.add(centeredParagraph("Embutidos Cáceres", BRAND_FONT, 2));
            document.add(centeredParagraph(title, TITLE_FONT, 2));
            document.add(centeredParagraph("Generated: " + LocalDateTime.now().format(DATE_TIME_FORMAT), META_FONT, 1));
            document.add(centeredParagraph(period, META_FONT, 10));

            if (rows.isEmpty()) {
                document.add(centeredParagraph("No records found for the selected criteria.", META_FONT, 12));
            } else {
                PdfPTable table = new PdfPTable(widths);
                table.setWidthPercentage(100);
                table.setHeaderRows(1);
                table.setSplitLate(false);

                for (String header : headers) {
                    table.addCell(tableCell(header, HEADER_FONT, TABLE_HEADER_COLOR, Element.ALIGN_CENTER));
                }
                for (int rowIndex = 0; rowIndex < rows.size(); rowIndex++) {
                    Color background = rowIndex % 2 == 0 ? Color.WHITE : ALTERNATE_ROW_COLOR;
                    for (String value : rows.get(rowIndex)) {
                        table.addCell(tableCell(value, CELL_FONT, background, Element.ALIGN_LEFT));
                    }
                }
                document.add(table);
            }

            Paragraph summaryParagraph = new Paragraph(summary, SUMMARY_FONT);
            summaryParagraph.setSpacingBefore(8);
            summaryParagraph.setAlignment(Element.ALIGN_RIGHT);
            document.add(summaryParagraph);
            document.close();
            return output.toByteArray();
        } catch (DocumentException | IOException exception) {
            throw new IllegalStateException("Could not generate PDF report", exception);
        }
    }

    private PdfPCell tableCell(String value, Font font, Color background, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(safe(value), font));
        cell.setBackgroundColor(background);
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        return cell;
    }

    private Paragraph centeredParagraph(String text, Font font, float spacingAfter) {
        Paragraph paragraph = new Paragraph(text, font);
        paragraph.setAlignment(Element.ALIGN_CENTER);
        paragraph.setSpacingAfter(spacingAfter);
        return paragraph;
    }

    private DateRange dateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && toDate.isBefore(fromDate)) {
            throw new BusinessException("toDate must not be before fromDate");
        }
        LocalDateTime fromDateTime = fromDate == null ? null : fromDate.atStartOfDay();
        LocalDateTime toDateTimeExclusive = toDate == null ? null : toDate.plusDays(1).atStartOfDay();
        return new DateRange(fromDate, toDate, fromDateTime, toDateTimeExclusive);
    }

    private String money(BigDecimal value) {
        BigDecimal amount = value == null ? BigDecimal.ZERO : value;
        return "S/ " + amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private String formatDate(LocalDate value) {
        return value == null ? "-" : value.format(DATE_FORMAT);
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "-" : value.format(DATE_TIME_FORMAT);
    }

    private String displayName(Enum<?> value) {
        if (value == null) {
            return "-";
        }
        String normalized = value.name().replace('_', ' ').toLowerCase(Locale.ROOT);
        return Character.toUpperCase(normalized.charAt(0)) + normalized.substring(1);
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }

    private record DateRange(
            LocalDate fromDate,
            LocalDate toDate,
            LocalDateTime fromDateTime,
            LocalDateTime toDateTimeExclusive
    ) {
        private String label() {
            if (fromDate == null && toDate == null) {
                return "All dates";
            }
            if (fromDate == null) {
                return "Through " + toDate.format(DATE_FORMAT);
            }
            if (toDate == null) {
                return "From " + fromDate.format(DATE_FORMAT);
            }
            return "From " + fromDate.format(DATE_FORMAT) + " through " + toDate.format(DATE_FORMAT);
        }
    }
}

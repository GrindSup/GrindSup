package com.grindsup.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.grindsup.backend.DTO.ReporteProgresoPlanesDTO;
import com.grindsup.backend.service.DynamicsReportService;
import com.grindsup.backend.service.ReporteService;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reportes")
public class ReportesController {

    @Autowired
    private ReporteService reporteService;
    @Autowired
    private DynamicsReportService dynamicsReportService;

    @GetMapping("/planes/alumno/{idAlumno}")
    public ResponseEntity<ReporteProgresoPlanesDTO> obtenerReporteProgresoPlanesAlumno(@PathVariable Long idAlumno) {
        ReporteProgresoPlanesDTO reporte = reporteService.generarReporteProgresoPlanesDeAlumno(idAlumno);
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/planes/alumno/{idAlumno}/pdf")
    public ResponseEntity<byte[]> exportarReporteProgresoPlanesPDF(@PathVariable Long idAlumno) {
        byte[] pdfBytes = dynamicsReportService.buildReporteProgresoPlanesPdf(idAlumno);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte_planes_" + idAlumno + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/planes/entrenador/{entrenadorId}/pdf")
    public ResponseEntity<byte[]> exportarReporteEntrenadorPDF(
            @PathVariable Long entrenadorId,
            @RequestParam(name = "from", required = false) String from,
            @RequestParam(name = "to", required = false) String to) {

        YearMonth desde = from != null && !from.isBlank() ? YearMonth.parse(from) : null;
        YearMonth hasta = to != null && !to.isBlank() ? YearMonth.parse(to) : null;
        byte[] pdfBytes = dynamicsReportService.buildReporteRatingsEntrenadorPdf(entrenadorId, desde, hasta);

        String fileName = String.format("reporte_entrenador_%d_%s_%s.pdf",
                entrenadorId,
                (desde != null ? desde : YearMonth.now().minusMonths(1)),
                (hasta != null ? hasta : YearMonth.now()));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

        // import java.time.YearMonth;
    // import java.time.format.DateTimeFormatter;
    // import org.springframework.http.HttpHeaders;
    // import org.springframework.http.MediaType;
    // import org.springframework.http.ResponseEntity;

    @GetMapping("/alumnos/entrenador/{entrenadorId}/pdf")
    public ResponseEntity<byte[]> exportAltasBajasPdf(
            @PathVariable Long entrenadorId,
            @RequestParam String from,   // "YYYY-MM"
            @RequestParam String to      // "YYYY-MM"
    ) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        YearMonth fromYm = YearMonth.parse(from, fmt);
        YearMonth toYm = YearMonth.parse(to, fmt);

        byte[] pdf = dynamicsReportService
                .buildReporteAltasBajasAlumnosPdf(entrenadorId, fromYm, toYm);

        String filename = String.format("reporte_alumnos_%d_%s_%s.pdf",
                entrenadorId, from, to).replaceAll("\\W+", "_");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }


}

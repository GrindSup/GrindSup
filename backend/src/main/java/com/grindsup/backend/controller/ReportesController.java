package com.grindsup.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grindsup.backend.DTO.ReporteProgresoPlanesDTO;
import com.grindsup.backend.service.DynamicsReportService;
import com.grindsup.backend.service.ReporteService;

@RestController
@RequestMapping("/api/reportes")
public class ReportesController {

    @Autowired
    private ReporteService reporteService;
    @Autowired
    private DynamicsReportService dynamicsReportService;

    @GetMapping("/rutinas/alumno/{idAlumno}")
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

}

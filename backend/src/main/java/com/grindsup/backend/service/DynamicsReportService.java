package com.grindsup.backend.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import com.grindsup.backend.DTO.ReporteProgresoPlanesDTO;
import jakarta.servlet.http.HttpServletResponse;
import net.sf.dynamicreports.jasper.builder.JasperReportBuilder;
import net.sf.dynamicreports.report.builder.DynamicReports;
import net.sf.dynamicreports.report.builder.column.Columns;
import net.sf.dynamicreports.report.builder.component.Components;
import net.sf.dynamicreports.report.builder.style.Styles;
import net.sf.dynamicreports.report.datasource.DRDataSource;
import net.sf.dynamicreports.report.exception.DRException;

import static net.sf.dynamicreports.report.builder.DynamicReports.*;
public class DynamicsReportService {

    @Autowired
    private ReporteService reportService;
    private void build(){
        try {
            report()
                .columns(
                    col.column("Alumno", "Nombre", type.stringType()),
                    col.column("Cantidad de Rutinas", "Total", type.stringType()),
                    col.column("Completas", "completas", type.stringType()),
                    col.column("Incompletas", "incompletas", type.stringType()))
        } catch (Exception e) {
            // TODO: handle exception
        }
    }

    
}
// public byte[] generarReporteProgresoPlanesPDF(Long idAlumno) {
//     ReporteProgresoPlanesDTO reporte = reportService.generarReporteProgresoPlanesDeAlumno(idAlumno);

//     try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
//         JasperReportBuilder report = DynamicReports.report();

//         report.columns(
//                 Columns.column("Campo", String.class),
//                 Columns.column("Valor", String.class)
//         )
//         .title(Components.text("Reporte de Rutinas del Alumno")
//                 .setStyle(Styles.style().bold().setFontSize(14)))
//         .setDataSource(new DRDataSource("Campo", "Valor",
//                 new Object[][]{
//                     {"Alumno", reporte.getNombreAlumno()},
//                     {"Total de rutinas", String.valueOf(reporte.getTotalRutinas())},
//                     {"Completadas", String.valueOf(reporte.getCompletadas())},
//                     {"Incompletas", String.valueOf(reporte.getIncompletas())},
//                     {"En proceso", String.valueOf(reporte.getEnProceso())},
//                     {"% Cumplimiento", String.format("%.2f %%", reporte.getPorcentajeCumplimiento())},
//                     {"Última completada", reporte.getUltimaRutinaCompletada()}
//                 }
//         ));

//         report.toPdf(out);
//         return out.toByteArray();
//     } catch (Exception e) {
//         throw new RuntimeException("Error al generar el reporte PDF", e);
//     }
//     }

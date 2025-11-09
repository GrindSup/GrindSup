package com.grindsup.backend.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.grindsup.backend.DTO.ReporteProgresoPlanesDTO;
import jakarta.servlet.http.HttpServletResponse;
import net.sf.dynamicreports.jasper.builder.JasperReportBuilder;
import net.sf.dynamicreports.report.builder.DynamicReports;
import net.sf.dynamicreports.report.builder.column.Columns;
import net.sf.dynamicreports.report.builder.component.Components;
import net.sf.dynamicreports.report.builder.datatype.DataTypes;
import net.sf.dynamicreports.report.builder.style.Styles;
import net.sf.dynamicreports.report.constant.HorizontalAlignment;
import net.sf.dynamicreports.report.constant.HorizontalTextAlignment;
import net.sf.dynamicreports.report.datasource.DRDataSource;
import net.sf.dynamicreports.report.exception.DRException;
import net.sf.jasperreports.engine.JRDataSource;

import static net.sf.dynamicreports.report.builder.DynamicReports.*;
@Service
public class DynamicsReportService {

    @Autowired
    private ReporteService reportService;

    public byte[] buildReporteProgresoPlanesPdf(Long idAlumno) {
        try {
            // Obtener los datos del reporte
            ReporteProgresoPlanesDTO datos = reportService.generarReporteProgresoPlanesDeAlumno(idAlumno);

            // Crear el DataSource de DynamicReports
            DRDataSource dataSource = new DRDataSource("alumno", "total", "completas", "incompletas", "enProceso", "porcentaje");
            dataSource.add(
                datos.getNombreAlumno(),
                // (int) (datos.getCompletadas() + datos.getEnProceso() + datos.getIncompletas()),
                (int) datos.getTotalRutinas(),
                (int) datos.getCompletadas(),
                (int) datos.getIncompletas(),
                (int) datos.getEnProceso(),
                String.format("%.2f%%", datos.getPorcentajeCumplimiento())
            );

            // Crear el reporte
            JasperReportBuilder report = DynamicReports.report()
                    .columns(
                        Columns.column("Alumno", "alumno", DataTypes.stringType()),
                        Columns.column("Total Rutinas", "total", DataTypes.integerType()),
                        Columns.column("Completas", "completas", DataTypes.integerType()),
                        Columns.column("Incompletas", "incompletas", DataTypes.integerType()),
                        Columns.column("En Proceso", "enProceso", DataTypes.integerType()),
                        Columns.column("% Cumplimiento", "porcentaje", DataTypes.stringType())
                    )
                    .title(Components.text("REPORTE DE PROGRESO DE PLANES DEL ALUMNO")
                            .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER))
                    .pageFooter(Components.pageXofY())
                    .setDataSource(dataSource);

            // Generar el PDF en memoria
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            report.toPdf(outputStream);

            return outputStream.toByteArray();

        } catch (Exception e) {
            e.printStackTrace(System.out);
            Throwable cause = e.getCause();
            while (cause != null) {
                cause.printStackTrace(System.out);
                cause = cause.getCause();
            }
            throw new RuntimeException("Error generando el reporte PDF", e);
        }
    }

}

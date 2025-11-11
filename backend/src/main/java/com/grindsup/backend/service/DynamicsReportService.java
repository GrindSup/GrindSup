package com.grindsup.backend.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.grindsup.backend.DTO.ReporteProgresoPlanesDTO;
import jakarta.servlet.http.HttpServletResponse;
import net.sf.dynamicreports.jasper.builder.JasperReportBuilder;
import net.sf.dynamicreports.report.builder.DynamicReports;
import net.sf.dynamicreports.report.builder.chart.PieChartBuilder;
import net.sf.dynamicreports.report.builder.column.Columns;
import net.sf.dynamicreports.report.builder.column.TextColumnBuilder;
import net.sf.dynamicreports.report.builder.component.Components;
import net.sf.dynamicreports.report.builder.datatype.DataTypes;
import net.sf.dynamicreports.report.builder.style.StyleBuilder;
import net.sf.dynamicreports.report.builder.style.Styles;
import net.sf.dynamicreports.report.constant.HorizontalAlignment;
import net.sf.dynamicreports.report.constant.HorizontalTextAlignment;
import net.sf.dynamicreports.report.constant.VerticalTextAlignment;
import net.sf.dynamicreports.report.datasource.DRDataSource;
import net.sf.dynamicreports.report.exception.DRException;
import net.sf.jasperreports.engine.JRDataSource;
import java.awt.Color;


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
            StyleBuilder boldStyle = DynamicReports.stl.style().bold();
            StyleBuilder columnTitleStyle = DynamicReports.stl.style(boldStyle)
                    .setBackgroundColor(Color.decode("#2E7D32")) // verde oscuro
                    .setForegroundColor(Color.WHITE)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setVerticalTextAlignment(VerticalTextAlignment.MIDDLE)
                    .setBorder(DynamicReports.stl.penThin());
            StyleBuilder columnStyle = DynamicReports.stl.style()
                    .setBorder(DynamicReports.stl.pen1Point())
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER);
            StyleBuilder titleStyle = DynamicReports.stl.style(boldStyle)
                    .setFontSize(16)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setForegroundColor(Color.decode("#1B5E20")); 
            // ===== GRÁFICO DE TORTA =====
            // ===== COLUMNAS PARA EL GRÁFICO =====
            TextColumnBuilder<String> estadoColumn = Columns.column("Estado", "estado", DataTypes.stringType());
            TextColumnBuilder<Integer> cantidadColumn = Columns.column("Cantidad", "cantidad", DataTypes.integerType());
            DRDataSource chartDataSource = new DRDataSource("estado", "cantidad");
                chartDataSource.add("Completas", (int) datos.getCompletadas());
                chartDataSource.add("En Proceso", (int) datos.getEnProceso());
                chartDataSource.add("Incompletas", (int) datos.getIncompletas());

            // ===== GRÁFICO DE TORTA =====
            PieChartBuilder pieChart = DynamicReports.cht.pieChart()
                .setTitle("Distribución de Rutinas")
                .setTitleFont(DynamicReports.stl.fontArialBold().setFontSize(12))
                .setKey(estadoColumn)
                .series(DynamicReports.cht.serie(cantidadColumn))
                .setDataSource(chartDataSource);   
                    
            // Crear el reporte
            JasperReportBuilder report = DynamicReports.report()
                    .setColumnTitleStyle(columnTitleStyle)
                    .setColumnStyle(columnStyle)
                    .title(
                        Components.text("REPORTE DE PROGRESO DE PLANES DEL ALUMNO")
                                .setStyle(titleStyle),
                        Components.text("Alumno: " + datos.getNombreAlumno())
                                .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER),
                        Components.verticalGap(10),
                        pieChart, // inserta el gráfico de torta
                        Components.verticalGap(20)
                    )
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
                    .summary(pieChart)
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

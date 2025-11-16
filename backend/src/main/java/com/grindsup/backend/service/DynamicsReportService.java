package com.grindsup.backend.service;

import java.io.ByteArrayOutputStream;
import java.awt.Color;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.grindsup.backend.DTO.AltasBajasMesDTO;
import com.grindsup.backend.DTO.RatingBucketDTO;
import com.grindsup.backend.DTO.RatingMesDTO;
import com.grindsup.backend.DTO.ReporteProgresoPlanesDTO;
import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.repository.EntrenadorRepository;

import net.sf.dynamicreports.jasper.builder.JasperReportBuilder;
import net.sf.dynamicreports.report.builder.DynamicReports;
import net.sf.dynamicreports.report.builder.chart.PieChartBuilder;
import net.sf.dynamicreports.report.builder.chart.BarChartBuilder;
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

import static net.sf.dynamicreports.report.builder.DynamicReports.*;

@Service
public class DynamicsReportService {

    @Autowired
    private ReporteService reportService;

    @Autowired
    private StatsService statsService;

    @Autowired
    private EntrenadorRepository entrenadorRepository;

    // ============================================================
    // ========== 1) REPORTE PROGRESO PLANES DEL ALUMNO ===========
    // ============================================================

    public byte[] buildReporteProgresoPlanesPdf(Long idAlumno) {
        try {
            ReporteProgresoPlanesDTO datos =
                    reportService.generarReporteProgresoPlanesDeAlumno(idAlumno);

            // --- Datos del entrenador (con defaults seguros) ---
            String entNom =
                    datos.getEntrenadorNombre() != null ? datos.getEntrenadorNombre() : "—";
            String entEmail =
                    datos.getEntrenadorCorreo() != null ? datos.getEntrenadorCorreo() : "—";
            String entTel =
                    datos.getEntrenadorTelefono() != null ? datos.getEntrenadorTelefono() : "—";

            // ================== ESTILOS BASE ==================
            StyleBuilder base = stl.style().setFontSize(10);

            StyleBuilder brandStyle = stl.style(base)
                    .bold()
                    .setFontSize(20)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setForegroundColor(Color.decode("#258d19"));

            StyleBuilder titleStyle = stl.style(base)
                    .bold()
                    .setFontSize(16)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setForegroundColor(Color.decode("#1B5E20"));

            StyleBuilder metaStyle = stl.style(base)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setForegroundColor(Color.DARK_GRAY);

            StyleBuilder tableHeader = stl.style(base)
                    .bold()
                    .setBackgroundColor(Color.decode("#2E7D32"))
                    .setForegroundColor(Color.WHITE)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setVerticalTextAlignment(VerticalTextAlignment.MIDDLE)
                    .setBorder(stl.penThin());

            StyleBuilder tableCell = stl.style(base)
                    .setBorder(stl.pen1Point())
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER);

            // ================== LOGO + BARRA ==================
            var logoUrl = getClass().getResource("/static/logo-grindsup.png");
            var logo = (logoUrl != null)
                    ? Components.image(logoUrl).setFixedDimension(60, 60)
                    : Components.image("logo-grindsup.png").setFixedDimension(60, 60);

            StyleBuilder headerBarStyle = stl.style()
                    .setBackgroundColor(Color.decode("#2e7d32"));

            var headerBar = Components.filler()
                    .setStyle(headerBarStyle)
                    .setFixedHeight(4);

            String fechaGen = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

            // ================== DATOS TABLA ==================
            DRDataSource tableData = new DRDataSource(
                    "alumno", "total", "completas", "incompletas", "enProceso", "porcentaje"
            );

            tableData.add(
                    datos.getNombreAlumno(),
                    (int) datos.getTotalRutinas(),
                    (int) datos.getCompletadas(),
                    (int) datos.getIncompletas(),
                    (int) datos.getEnProceso(),
                    String.format("%.2f%%", datos.getPorcentajeCumplimiento())
            );

            // ================== GRÁFICO ==================
            TextColumnBuilder<String> estadoCol =
                    Columns.column("Estado", "estado", DataTypes.stringType());
            TextColumnBuilder<Integer> cantCol =
                    Columns.column("Cantidad", "cantidad", DataTypes.integerType());

            DRDataSource chartData = new DRDataSource("estado", "cantidad");
            chartData.add("Completas", (int) datos.getCompletadas());
            chartData.add("En Proceso", (int) datos.getEnProceso());
            chartData.add("Incompletas", (int) datos.getIncompletas());

            PieChartBuilder pie = DynamicReports.cht.pieChart()
                    .setKey(estadoCol)
                    .series(DynamicReports.cht.serie(cantCol))
                    .setTitle("Distribución de rutinas")
                    .setTitleFont(Styles.fontArialBold().setFontSize(12))
                    .setDataSource(chartData);

            // ================== HEADER ==================
            var header = Components.horizontalList(
                    logo,
                    Components.verticalList(
                            Components.text("GrindSup").setStyle(brandStyle),
                            Components.text("Reporte de Progreso del Alumno")
                                    .setStyle(titleStyle),
                            Components.text("Generado el: " + fechaGen)
                                    .setStyle(metaStyle),
                            Components.text(
                                    "Entrenador: " + entNom +
                                    "  |  Email: " + entEmail +
                                    "  |  Teléfono: " + entTel
                            ).setStyle(metaStyle)
                    )
            ).setFixedHeight(70);

            // ================== RESUMEN ==================
            var resumen = Components.horizontalList(
                    Components.text("Total rutinas: " + (int) datos.getTotalRutinas()),
                    Components.text("Completas: " + (int) datos.getCompletadas()),
                    Components.text("En proceso: " + (int) datos.getEnProceso()),
                    Components.text("Incompletas: " + (int) datos.getIncompletas()),
                    Components.text(String.format("Cumplimiento: %.2f%%",
                            datos.getPorcentajeCumplimiento()))
            ).setStyle(metaStyle);

            // ================== REPORTE ==================
            JasperReportBuilder report = DynamicReports.report()
                    .setColumnTitleStyle(tableHeader)
                    .setColumnStyle(tableCell)
                    .title(
                            header,
                            Components.verticalGap(10),
                            Components.text("Alumno: " + datos.getNombreAlumno())
                                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER),
                            Components.verticalGap(5),
                            resumen,
                            Components.verticalGap(10),
                            headerBar,
                            Components.verticalGap(10)
                    )
                    .columns(
                            Columns.column("Alumno", "alumno", DataTypes.stringType()),
                            Columns.column("Total Rutinas", "total", DataTypes.integerType()),
                            Columns.column("Completas", "completas", DataTypes.integerType()),
                            Columns.column("Incompletas", "incompletas", DataTypes.integerType()),
                            Columns.column("En Proceso", "enProceso", DataTypes.integerType()),
                            Columns.column("% Cumplimiento", "porcentaje",
                                    DataTypes.stringType())
                    )
                    .summary(
                            Components.verticalGap(10),
                            Components.text("Distribución de rutinas")
                                    .setStyle(titleStyle),
                            pie
                    )
                    .pageFooter(Components.pageXofY())
                    .setDataSource(tableData);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            report.toPdf(baos);
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando el reporte PDF de progreso de planes", e);
        }
    }

    // ============================================================
    // == 2) REPORTE ALUMNOS: ALTAS / BAJAS / ACTIVOS (POR MESES) ==
    // ============================================================

    public byte[] buildReporteAltasBajasAlumnosPdf(Long entrenadorId,
                                                   YearMonth fromYm,
                                                   YearMonth toYm) {
        try {
            if (entrenadorId == null) {
                throw new IllegalArgumentException("entrenadorId es requerido");
            }

            YearMonth desde = (fromYm != null) ? fromYm : YearMonth.now().minusMonths(1);
            YearMonth hasta = (toYm != null) ? toYm : YearMonth.now();

            if (hasta.isBefore(desde)) {
                YearMonth tmp = desde;
                desde = hasta;
                hasta = tmp;
            }

            LocalDate fromDate = desde.atDay(1);
            LocalDate toExcl = hasta.plusMonths(1).atDay(1);

            // Datos crudos desde StatsService
            List<AltasBajasMesDTO> altasBajas =
                    statsService.altasBajasPorMes(entrenadorId, fromDate, toExcl);
            List<AltasBajasMesDTO> activosList =
                    statsService.activosFinDeMes(entrenadorId, fromDate, toExcl);

            // === Merge por mes: month -> [altas, bajas, activos] ===
            Map<String, long[]> porMes = new TreeMap<>(); // ordenado YYYY-MM

            for (AltasBajasMesDTO ab : altasBajas) {
                if (ab == null || ab.getMonth() == null) continue;
                long[] arr = porMes.computeIfAbsent(ab.getMonth(), m -> new long[3]);
                arr[0] = ab.getAltas() != null ? ab.getAltas() : 0L;
                arr[1] = ab.getBajas() != null ? ab.getBajas() : 0L;
            }

            for (AltasBajasMesDTO af : activosList) {
                if (af == null || af.getMonth() == null) continue;
                long[] arr = porMes.computeIfAbsent(af.getMonth(), m -> new long[3]);
                // en activosFinDeMes el campo "altas" representa los activos
                arr[2] = af.getAltas() != null ? af.getAltas() : 0L;
            }

            long totalAltas = 0L;
            long totalBajas = 0L;

            DRDataSource tablaData =
                    new DRDataSource("mes", "altas", "bajas", "activos");

            for (Map.Entry<String, long[]> e : porMes.entrySet()) {
                String mes = e.getKey();
                long[] vals = e.getValue();
                long altas = vals[0];
                long bajas = vals[1];
                long activos = vals[2];

                totalAltas += altas;
                totalBajas += bajas;

                tablaData.add(mes, altas, bajas, activos);
            }

            // ================== ESTILOS ==================
            StyleBuilder base = stl.style().setFontSize(10);

            StyleBuilder brand = stl.style(base)
                    .bold()
                    .setFontSize(20)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setForegroundColor(Color.decode("#258d19"));

            StyleBuilder title = stl.style(base)
                    .bold()
                    .setFontSize(16)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setForegroundColor(Color.decode("#1B5E20"));

            StyleBuilder meta = stl.style(base)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setForegroundColor(Color.DARK_GRAY);

            StyleBuilder tableHeader = stl.style(base)
                    .bold()
                    .setBackgroundColor(Color.decode("#2E7D32"))
                    .setForegroundColor(Color.WHITE)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setVerticalTextAlignment(VerticalTextAlignment.MIDDLE)
                    .setBorder(stl.penThin());

            StyleBuilder tableCell = stl.style(base)
                    .setBorder(stl.pen1Point())
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER);

            // ================== LOGO + HEADER ==================
            var logoUrl2 = getClass().getResource("/static/logo-grindsup.png");
            var logo2 = (logoUrl2 != null)
                    ? Components.image(logoUrl2).setFixedDimension(60, 60)
                    : Components.image("logo-grindsup.png").setFixedDimension(60, 60);

            String fechaGen2 = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

            Entrenador entrenador = entrenadorRepository.findById(entrenadorId)
                    .orElseThrow(() -> new IllegalArgumentException("Entrenador no encontrado"));

            String nombreEntrenador =
                    (entrenador.getUsuario() != null)
                            ? entrenador.getUsuario().getNombre() + " " +
                              entrenador.getUsuario().getApellido()
                            : "Sin nombre";

            var header2 = Components.horizontalList(
                    logo2,
                    Components.verticalList(
                            Components.text("GrindSup").setStyle(brand),
                            Components.text("Reporte de Altas, Bajas y Activos de Alumnos")
                                    .setStyle(title),
                            Components.text("Generado: " + fechaGen2).setStyle(meta),
                            Components.text("Entrenador: " + nombreEntrenador).setStyle(meta),
                            Components.text(String.format("Periodo: %s a %s",
                                    desde.toString(), hasta.toString()))
                                    .setStyle(meta)
                    )
            ).setFixedHeight(70);

            var resumen2 = Components.horizontalList(
                    Components.text("Total Altas: " + totalAltas),
                    Components.text("Total Bajas: " + totalBajas)
            ).setStyle(meta);

            // ================== COLUMNAS TABLA ==================
            TextColumnBuilder<String> mesCol =
                    Columns.column("Mes", "mes", DataTypes.stringType());
            TextColumnBuilder<Long> altasCol =
                    Columns.column("Altas", "altas", DataTypes.longType());
            TextColumnBuilder<Long> bajasCol =
                    Columns.column("Bajas", "bajas", DataTypes.longType());
            TextColumnBuilder<Long> activosCol =
                    Columns.column("Activos fin de mes", "activos", DataTypes.longType());

            // ================== GRÁFICO BARRAS ==================
            BarChartBuilder barChart = DynamicReports.cht.barChart()
                    .setCategory(mesCol)
                    .series(
                            DynamicReports.cht.serie(altasCol),
                            DynamicReports.cht.serie(bajasCol),
                            DynamicReports.cht.serie(activosCol)
                    )
                    .setTitle("Altas, bajas y activos por mes")
                    .setTitleFont(Styles.fontArialBold().setFontSize(12))
                    .setDataSource(tablaData);

            // ================== GRÁFICO TORTA ALTAS/BAJAS ==================
            TextColumnBuilder<String> tipoCol =
                    Columns.column("Tipo", "tipo", DataTypes.stringType());
            TextColumnBuilder<Long> cantCol =
                    Columns.column("Cantidad", "cantidad", DataTypes.longType());

            DRDataSource pieData = new DRDataSource("tipo", "cantidad");
            pieData.add("Altas", totalAltas);
            pieData.add("Bajas", totalBajas);

            PieChartBuilder pieChart = DynamicReports.cht.pieChart()
                    .setKey(tipoCol)
                    .series(DynamicReports.cht.serie(cantCol))
                    .setTitle("Distribución total Altas vs Bajas")
                    .setTitleFont(Styles.fontArialBold().setFontSize(12))
                    .setDataSource(pieData);

            // ================== REPORTE ==================
            JasperReportBuilder report2 = DynamicReports.report()
                    .setColumnTitleStyle(tableHeader)
                    .setColumnStyle(tableCell)
                    .title(
                            header2,
                            Components.verticalGap(10),
                            resumen2,
                            Components.verticalGap(10)
                    )
                    .columns(mesCol, altasCol, bajasCol, activosCol)
                    .setDataSource(tablaData)
                    .summary(
                            Components.verticalGap(10),
                            barChart,
                            Components.verticalGap(10),
                            pieChart
                    )
                    .pageFooter(Components.pageXofY());

            ByteArrayOutputStream baos2 = new ByteArrayOutputStream();
            report2.toPdf(baos2);
            return baos2.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF de alumnos (altas/bajas/activos)", e);
        }
    }

    // ============================================================
    // ==== 3) REPORTE RATINGS PLANES POR ENTRENADOR (SCORE) ======
    // ============================================================

    public byte[] buildReporteRatingsEntrenadorPdf(Long entrenadorId,
                                                   YearMonth fromYm,
                                                   YearMonth toYm) {
        try {
            if (entrenadorId == null) {
                throw new IllegalArgumentException("entrenadorId es requerido");
            }

            YearMonth desde = (fromYm != null) ? fromYm : YearMonth.now().minusMonths(1);
            YearMonth hasta = (toYm != null) ? toYm : YearMonth.now();

            if (hasta.isBefore(desde)) {
                YearMonth tmp = desde;
                desde = hasta;
                hasta = tmp;
            }

            LocalDate fromDate = desde.atDay(1);
            LocalDate toExcl = hasta.plusMonths(1).atDay(1);

            Entrenador entrenador = entrenadorRepository.findById(entrenadorId)
                    .orElseThrow(() -> new IllegalArgumentException("Entrenador no encontrado"));

            List<RatingMesDTO> mensual =
                    statsService.planesRatingMensual(entrenadorId, fromDate, toExcl);
            List<RatingBucketDTO> buckets =
                    statsService.planesRatingDistribucion(entrenadorId, fromDate, toExcl);

            long totalEvaluaciones = mensual.stream()
                    .mapToLong(m -> m.count() == null ? 0 : m.count())
                    .sum();

            double weighted = mensual.stream()
                    .mapToDouble(m -> (m.avg() == null ? 0.0 : m.avg())
                            * (m.count() == null ? 0 : m.count()))
                    .sum();

            double promedioGlobal = totalEvaluaciones > 0
                    ? weighted / totalEvaluaciones
                    : 0.0;

            // ================== DATASETS ==================
            DRDataSource mensualData = new DRDataSource("mes", "promedio", "evaluaciones");
            mensual.forEach(m -> mensualData.add(
                    m.month(),
                    m.avg() == null ? 0.0 : m.avg(),
                    m.count() == null ? 0L : m.count()
            ));

            DRDataSource bucketData = new DRDataSource("score", "cantidad");
            buckets.forEach(b -> bucketData.add(
                    String.valueOf(b.score() == null ? 0 : b.score()),
                    b.count() == null ? 0L : b.count()
            ));

            // ================== ESTILOS ==================
            StyleBuilder bold = stl.style().bold();

            StyleBuilder brand = stl.style(bold)
                    .setFontSize(20)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setForegroundColor(Color.decode("#258d19"));

            StyleBuilder title = stl.style(bold)
                    .setFontSize(16)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setForegroundColor(Color.decode("#1B5E20"));

            StyleBuilder meta = stl.style()
                    .setFontSize(10)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setForegroundColor(Color.DARK_GRAY);

            StyleBuilder tableHeader = stl.style(bold)
                    .setBackgroundColor(Color.decode("#2E7D32"))
                    .setForegroundColor(Color.WHITE)
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER)
                    .setVerticalTextAlignment(VerticalTextAlignment.MIDDLE)
                    .setBorder(stl.penThin());

            StyleBuilder tableCell = stl.style()
                    .setFontSize(10)
                    .setBorder(stl.pen1Point())
                    .setHorizontalTextAlignment(HorizontalTextAlignment.CENTER);

            // ================== COLUMNAS ==================
            TextColumnBuilder<String> mesCol =
                    Columns.column("Mes", "mes", DataTypes.stringType());
            TextColumnBuilder<Double> promCol =
                    Columns.column("Promedio", "promedio", DataTypes.doubleType());
            TextColumnBuilder<Long> evalCol =
                    Columns.column("Evaluaciones", "evaluaciones", DataTypes.longType());

            TextColumnBuilder<String> bucketScore =
                    Columns.column("Score", "score", DataTypes.stringType());
            TextColumnBuilder<Long> bucketCantidad =
                    Columns.column("Cantidad", "cantidad", DataTypes.longType());

            // ================== LOGO + HEADER ==================
            var logoUrl3 = getClass().getResource("/static/logo-grindsup.png");
            var logo3 = (logoUrl3 != null)
                    ? Components.image(logoUrl3)
                        .setHorizontalAlignment(HorizontalAlignment.LEFT)
                        .setFixedDimension(60, 60)
                    : Components.image("logo-grindsup.png")
                        .setHorizontalAlignment(HorizontalAlignment.LEFT)
                        .setFixedDimension(60, 60);

            String fechaGen3 = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

            String nombreEntrenador2 =
                    (entrenador.getUsuario() != null)
                            ? entrenador.getUsuario().getNombre() + " " +
                              entrenador.getUsuario().getApellido()
                            : "Sin nombre";

            var header3 = Components.horizontalList(
                    logo3,
                    Components.verticalList(
                            Components.text("GrindSup").setStyle(brand),
                            Components.text("Reporte de Evaluaciones de Planes por Entrenador")
                                    .setStyle(title),
                            Components.text("Generado: " + fechaGen3).setStyle(meta),
                            Components.text("Entrenador: " + nombreEntrenador2)
                                    .setStyle(meta),
                            Components.text(String.format("Periodo: %s a %s",
                                    desde.toString(), hasta.toString()))
                                    .setStyle(meta)
                    )
            ).setFixedHeight(70);

            var resumen3 = Components.horizontalList(
                    Components.text(String.format("Promedio global: %.2f", promedioGlobal)),
                    Components.text("Total evaluaciones: " + totalEvaluaciones),
                    Components.text("Planes calificados: " + buckets.stream()
                            .mapToLong(b -> b.count() == null ? 0 : b.count()).sum())
            ).setStyle(meta);

            // ================== GRÁFICO BARRAS ==================
            BarChartBuilder bucketChart = DynamicReports.cht.barChart()
                    .setCategory(bucketScore)
                    .series(DynamicReports.cht.serie(bucketCantidad))
                    .setTitle("Distribución de puntajes")
                    .setTitleFont(Styles.fontArialBold().setFontSize(12))
                    .setDataSource(bucketData);

            JasperReportBuilder report3 = DynamicReports.report()
                    .setColumnTitleStyle(tableHeader)
                    .setColumnStyle(tableCell)
                    .title(
                            header3,
                            Components.verticalGap(10),
                            resumen3,
                            Components.verticalGap(10)
                    )
                    .columns(mesCol, promCol, evalCol)
                    .setDataSource(mensualData)
                    .summary(
                            Components.verticalGap(10),
                            bucketChart
                    )
                    .pageFooter(Components.pageXofY());

            ByteArrayOutputStream baos3 = new ByteArrayOutputStream();
            report3.toPdf(baos3);
            return baos3.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF de reportes del entrenador", e);
        }
    }
}

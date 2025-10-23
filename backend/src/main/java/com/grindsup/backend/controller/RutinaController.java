package com.grindsup.backend.controller;

import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.model.RutinaEjercicio;
import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.RutinaRepository;
import com.grindsup.backend.repository.RutinaEjercicioRepository;
import com.grindsup.backend.repository.PlanEntrenamientoRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.service.RutinaService;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import java.awt.Color;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rutinas")
@CrossOrigin(origins = "*")
public class RutinaController {

    private final GrupoMuscularController grupoMuscularController;

    @Autowired
    private RutinaRepository rutinaRepository;

    @Autowired
    private RutinaEjercicioRepository rutinaEjercicioRepository;

    @Autowired
    private PlanEntrenamientoRepository planRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private RutinaService rutinaService;

    RutinaController(GrupoMuscularController grupoMuscularController) {
        this.grupoMuscularController = grupoMuscularController;
    }

    // ==========================
    // CRUD
    // ==========================

    @GetMapping
    public List<Rutina> getAll() {
        return rutinaRepository.findAll();
    }

    @GetMapping("/{id}")
    public Rutina getById(@PathVariable Long id) {
        return rutinaRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Rutina create(@RequestBody Rutina rutina) {
        if (rutina.getPlan() != null) {
            PlanEntrenamiento plan = planRepository.findById(rutina.getPlan().getId_plan()).orElse(null);
            rutina.setPlan(plan);
        }
        if (rutina.getEstado() != null) {
            Estado estado = estadoRepository.findById(rutina.getEstado().getId_estado()).orElse(null);
            rutina.setEstado(estado);
        }
        return rutinaRepository.save(rutina);
    }

    @PutMapping("/{id}")
    public Rutina update(@PathVariable Long id, @RequestBody Rutina rutina) {
        return rutinaRepository.findById(id).map(existing -> {
            existing.setNombre(rutina.getNombre());
            existing.setDescripcion(rutina.getDescripcion());
            if (rutina.getPlan() != null) {
                PlanEntrenamiento plan = planRepository.findById(rutina.getPlan().getId_plan()).orElse(null);
                existing.setPlan(plan);
            }
            if (rutina.getEstado() != null) {
                Estado estado = estadoRepository.findById(rutina.getEstado().getId_estado()).orElse(null);
                existing.setEstado(estado);
            }
            return rutinaRepository.save(existing);
        }).orElse(null);
    }

    /** REST estándar: DELETE /api/rutinas/{id} — usa borrado lógico del service */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rutinaService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    /** Alias compatible: POST /api/rutinas/{id}/delete */
    @PostMapping("/{id}/delete")
    public ResponseEntity<Void> deleteAlias(@PathVariable Long id) {
        rutinaService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================
    // HU24 - Visualizar Rutina
    // ==========================
    @GetMapping("/{id}/detalle")
    public ResponseEntity<?> getRutinaDetalle(@PathVariable Long id) {
        return rutinaRepository.findById(id)
                .map(rutina -> {
                    List<RutinaEjercicio> ejercicios = rutinaEjercicioRepository.findAll()
                            .stream()
                            .filter(re -> re.getRutina().getId_rutina().equals(id) && re.getDeleted_at() == null)
                            .collect(Collectors.toList());

                    Map<String, Object> resultado = new HashMap<>();
                    resultado.put("rutina", rutina);
                    resultado.put("ejercicios", ejercicios);

                    return ResponseEntity.ok(resultado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================
    // HU25 - Exportar Rutina a PDF
    // ==========================
    @GetMapping("/{id}/exportar")
    public void exportarRutinaPDF(@PathVariable Long id, HttpServletResponse response) throws Exception {
        Rutina rutina = rutinaRepository.findById(id).orElse(null);
        if (rutina == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Rutina no encontrada");
            return;
        }

        List<RutinaEjercicio> ejercicios = rutinaEjercicioRepository.findAll()
                .stream()
                .filter(re -> re.getRutina().getId_rutina().equals(id) && re.getDeleted_at() == null)
                .collect(Collectors.toList());

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=rutina_" + id + ".pdf");

        Document document = new Document(PageSize.A4, 40, 40, 60, 40);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        // ======= COLORES =======
        Color colorPrincipal = new Color(40, 167, 69);
        Color colorSecundario = new Color(230, 247, 237);
        Color blanco = Color.WHITE;

        // ======= FUENTES =======
        String rutaFuente = "C:/Windows/Fonts/times.ttf"; // Times New Roman
        BaseFont baseFont = BaseFont.createFont(rutaFuente, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        Font fontTitulo = new Font(baseFont, 22, Font.BOLD, colorPrincipal);
        Font fontNormal = new Font(baseFont, 12, Font.NORMAL, Color.BLACK);
        Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, blanco);

        // ======= LOGO Y TITULO EN LA MISMA FILA =======
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[] { 1f, 3f }); // ancho relativo
        headerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        // Columna 1: logo
        try {
            String rutaLogo = "C:/Users/Blue Oyola/GrindSupBackend/backend/src/main/resources/static/logo-grindsup.png";
            Image logo = Image.getInstance(rutaLogo);
            logo.scaleToFit(80, 80);
            PdfPCell logoCell = new PdfPCell(logo, false);
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            headerTable.addCell(logoCell);
        } catch (Exception e) {
            PdfPCell emptyCell = new PdfPCell(new Phrase(""));
            emptyCell.setBorder(Rectangle.NO_BORDER);
            headerTable.addCell(emptyCell);
        }

        // Columna 2: título
        PdfPCell titleCell = new PdfPCell(new Phrase(rutina.getNombre(), fontTitulo));
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        headerTable.addCell(titleCell);

        document.add(headerTable);
        document.add(Chunk.NEWLINE);

        // ======= DESCRIPCION DETALLADA =======
        Paragraph desc = new Paragraph("Descripción: " + rutina.getDescripcion(), fontNormal);
        document.add(desc);

        if (rutina.getPlan() != null) {
            Paragraph plan = new Paragraph("Plan asociado: " + rutina.getPlan().getId_plan(), fontNormal);
            document.add(plan);

            String duracionStr = humanizeSecs(calcDurationSecs(ejercicios));
            Paragraph duracion = new Paragraph("Duración: " + duracionStr, fontNormal);
            document.add(duracion);

            if (rutina.getPlan().getAlumno() != null) {
                Paragraph alumno = new Paragraph("Alumno: " + rutina.getPlan().getAlumno().getNombre(), fontNormal);
                document.add(alumno);
            }
        }

        document.add(Chunk.NEWLINE);

        // ======= TABLA DE EJERCICIOS =======
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        table.setSpacingAfter(10);
        table.setWidths(new float[] { 2f, 3f, 1f, 1.5f, 1.5f });

        String[] headers = { "Grupos Musculares", "Ejercicio", "Series", "Repeticiones", "Descanso(s)" };
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, fontHeader));
            cell.setBackgroundColor(colorPrincipal);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(8);
            cell.setBorderColor(colorPrincipal.darker());
            table.addCell(cell);
        }

        boolean alternar = false;
        for (RutinaEjercicio re : ejercicios) {
            Color bg = alternar ? colorSecundario : blanco;
            alternar = !alternar;

            table.addCell(makeCell(re.getGrupo_muscular(), fontNormal, bg));
            table.addCell(makeCell(re.getEjercicio().getNombre(), fontNormal, bg));
            table.addCell(makeCell(str(re.getSeries()), fontNormal, bg));
            table.addCell(makeCell(str(re.getRepeticiones()), fontNormal, bg));
            table.addCell(makeCell(str(re.getDescanso_segundos()), fontNormal, bg));
        }

        document.add(table);

        // ======= PIE DE PAGINA =======
        Paragraph footer = new Paragraph("Generado por GrindSup - " + new Date(),
                FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY));
        footer.setAlignment(Element.ALIGN_RIGHT);
        document.add(footer);

        document.close();
    }

    // ======= MÉTODOS AUXILIARES =======
    private PdfPCell makeCell(String texto, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(texto != null ? texto : "", font));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBorderColor(new Color(230, 230, 230));
        return cell;
    }

    private String str(Object o) {
        return o != null ? o.toString() : "";
    }

    // ======= CALCULO DE DURACION =======
    private long calcDurationSecs(List<RutinaEjercicio> ejercicios) {
        if (ejercicios == null)
            return 0;
        long total = 0;
        for (RutinaEjercicio re : ejercicios) {
            int series = re.getSeries() != null ? re.getSeries() : 0;
            int reps = re.getRepeticiones() != null ? re.getRepeticiones() : 0;
            int descanso = re.getDescanso_segundos() != null ? re.getDescanso_segundos() : 0;
            total += series * (reps * 2 + descanso);
        }
        return total;
    }

    private String humanizeSecs(long totalSecs) {
        if (totalSecs <= 0)
            return "—";
        long m = totalSecs / 60;
        long s = totalSecs % 60;
        if (m >= 60) {
            long h = m / 60;
            long mm = m % 60;
            return "≈ " + h + "h " + mm + "m";
        }
        return "≈ " + m + "m " + s + "s";
    }

}

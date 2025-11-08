package com.grindsup.backend.controller;

import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.model.RutinaEjercicio;
import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.Ejercicio;

import com.grindsup.backend.repository.RutinaRepository;
import com.grindsup.backend.repository.RutinaEjercicioRepository;
import com.grindsup.backend.repository.PlanEntrenamientoRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.EjercicioRepository;

import com.grindsup.backend.service.RutinaService;

import com.grindsup.backend.DTO.RutinaUpdateRequestDTO;
import com.grindsup.backend.DTO.CrearRutinarequestDTO;
import com.grindsup.backend.DTO.EjercicioRutinaDTO;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;

import java.awt.Color;
import java.util.*;
import java.util.List;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rutinas")
@CrossOrigin(origins = "*")
public class RutinaController {

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
    @Autowired
    private EjercicioRepository ejercicioRepository;

    @GetMapping
    public List<Rutina> getAll() {
        return rutinaRepository.findAll()
                .stream()
                .filter(r -> r.getDeleted_at() == null)
                .toList();
    }

    @GetMapping("/{id}")
    public Rutina getById(@PathVariable Long id) {
        return rutinaRepository.findById(id).orElse(null);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Rutina> create(@RequestBody CrearRutinarequestDTO request) {

        Rutina rutina = new Rutina();
        rutina.setNombre(request.getNombre());
        rutina.setDescripcion(request.getDescripcion());

        if (request.getPlanId() != null) {
            PlanEntrenamiento plan = planRepository.findById(request.getPlanId())
                    .orElseThrow(() -> new RuntimeException("Plan no encontrado: " + request.getPlanId()));
            rutina.setPlan(plan);
        }

        Long estadoId = (request.getIdEstado() != null) ? request.getIdEstado() : 1L;
        Estado estadoRutina = estadoRepository.findById(estadoId)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
        rutina.setEstado(estadoRutina);

        Rutina nuevaRutina = rutinaRepository.save(rutina);

        if (request.getEjercicios() != null && !request.getEjercicios().isEmpty()) {
            List<RutinaEjercicio> lista = new ArrayList<>();
            for (EjercicioRutinaDTO dto : request.getEjercicios()) {
                Ejercicio ejercicio = ejercicioRepository.findById(dto.getIdEjercicio())
                        .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado: " + dto.getIdEjercicio()));

                RutinaEjercicio re = new RutinaEjercicio();
                re.setRutina(nuevaRutina);
                re.setEjercicio(ejercicio);
                re.setSeries(dto.getSeries());
                re.setRepeticiones(dto.getRepeticiones());
                re.setObservaciones(dto.getObservaciones());
                re.setGrupo_muscular(dto.getGrupoMuscular());
                re.setEstado(estadoRutina);

                lista.add(re);
            }
            rutinaEjercicioRepository.saveAll(lista);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaRutina);
    }

    @PutMapping("/{id}")
    public Rutina update(@PathVariable Long id, @RequestBody RutinaUpdateRequestDTO dto) {
        return rutinaService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rutinaService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<Void> deleteAlias(@PathVariable Long id) {
        rutinaService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/detalle")
    public ResponseEntity<?> getRutinaDetalle(@PathVariable Long id) {
        return rutinaRepository.findById(id)
                .map(rutina -> {
                    List<RutinaEjercicio> ejercicios = rutinaEjercicioRepository.findActivosByRutinaId(id);
                    Map<String, Object> resultado = new HashMap<>();
                    resultado.put("rutina", rutina);
                    resultado.put("ejercicios", ejercicios);
                    return ResponseEntity.ok(resultado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/exportar")
    public void exportarRutinaPDF(@PathVariable Long id, HttpServletResponse response) throws Exception {

        Rutina rutina = rutinaRepository.findById(id).orElse(null);
        if (rutina == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Rutina no encontrada");
            return;
        }

        List<RutinaEjercicio> ejercicios = rutinaEjercicioRepository.findActivosByRutinaId(id);

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=rutina_" + id + ".pdf");

        Document document = new Document(PageSize.A4, 40, 40, 60, 40);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        Color colorPrincipal = new Color(40, 167, 69);
        Color colorSecundario = new Color(230, 247, 237);
        Color blanco = Color.WHITE;

        String rutaFuente = "C:/Windows/Fonts/times.ttf";
        BaseFont baseFont = BaseFont.createFont(rutaFuente, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);

        Font fontTitulo = new Font(baseFont, 22, Font.BOLD, colorPrincipal);
        Font fontNormal = new Font(baseFont, 12, Font.NORMAL, Color.BLACK);
        Font fontHeader = new Font(baseFont, 12, Font.BOLD, Color.WHITE);

        // HEADER ESTILIZADO
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[] { 1f, 3f });
        headerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        try {
            String rutaLogo = "C:/Users/Blue Oyola/GrindSupBackend/backend/src/main/resources/static/logo-grindsup.png";
            Image logo = Image.getInstance(rutaLogo);
            logo.scaleToFit(70, 70);
            PdfPCell logoCell = new PdfPCell(logo, false);
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            headerTable.addCell(logoCell);
        } catch (Exception e) {
            PdfPCell emptyCell = new PdfPCell(new Phrase(""));
            emptyCell.setBorder(Rectangle.NO_BORDER);
            headerTable.addCell(emptyCell);
        }

        PdfPCell titleCell = new PdfPCell();
        titleCell.setBorder(Rectangle.NO_BORDER);

        Paragraph title = new Paragraph(rutina.getNombre(), fontTitulo);
        title.setSpacingAfter(3);
        titleCell.addElement(title);

        Paragraph sub = new Paragraph("Rutina personalizada", new Font(baseFont, 12, Font.ITALIC, Color.GRAY));
        titleCell.addElement(sub);

        headerTable.addCell(titleCell);
        document.add(headerTable);

        LineSeparator separator = new LineSeparator(1, 100, colorPrincipal, Element.ALIGN_CENTER, -2);
        document.add(separator);
        document.add(Chunk.NEWLINE);

        // Descripción y Alumno
        document.add(new Paragraph("Descripción: " + rutina.getDescripcion(), fontNormal));
        if (rutina.getPlan() != null && rutina.getPlan().getAlumno() != null)
            document.add(new Paragraph("Alumno: " + rutina.getPlan().getAlumno().getNombre(), fontNormal));
        document.add(Chunk.NEWLINE);

        // TABLA
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        table.setWidths(new float[] { 2f, 3f, 1f, 1.4f, 3f });

        String[] headers = { "Grupo Muscular", "Ejercicio", "Series", "Reps", "Observaciones" };
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, fontHeader));
            cell.setBackgroundColor(colorPrincipal);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(8);
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
            table.addCell(makeCell(
                    (re.getObservaciones() == null || re.getObservaciones().isBlank()) ? "-" : re.getObservaciones(),
                    fontNormal, bg));
        }

        document.add(table);

        Paragraph footer = new Paragraph("Generado por GrindSup - " + new Date(),
                new Font(baseFont, 10, Font.ITALIC, Color.GRAY));
        footer.setAlignment(Element.ALIGN_RIGHT);
        document.add(footer);

        document.close();
    }

    private PdfPCell makeCell(String texto, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(texto != null ? texto : "", font));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBorderColor(new Color(210, 210, 210));
        return cell;
    }

    private String str(Object o) {
        return o != null ? o.toString() : "";
    }
}
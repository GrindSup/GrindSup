package com.grindsup.backend.controller;

import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.model.RutinaEjercicio;
import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.RutinaRepository;
import com.grindsup.backend.repository.RutinaEjercicioRepository;
import com.grindsup.backend.repository.PlanEntrenamientoRepository;
import com.grindsup.backend.repository.EstadoRepository;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rutinas")
public class RutinaController {

    @Autowired
    private RutinaRepository rutinaRepository;

    @Autowired
    private RutinaEjercicioRepository rutinaEjercicioRepository;

    @Autowired
    private PlanEntrenamientoRepository planRepository;

    @Autowired
    private EstadoRepository estadoRepository;

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

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        rutinaRepository.deleteById(id);
        return "Rutina eliminada con id " + id;
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

        // Configurar el response
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=rutina_" + id + ".pdf");

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("Rutina: " + rutina.getNombre(), titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        document.add(new Paragraph("Descripción: " + rutina.getDescripcion()));
        document.add(
                new Paragraph("Plan asociado: " + (rutina.getPlan() != null ? rutina.getPlan().getId_plan() : "N/A")));
        document.add(Chunk.NEWLINE);

        PdfPTable table = new PdfPTable(5);
        table.addCell("Ejercicio");
        table.addCell("Series");
        table.addCell("Repeticiones");
        table.addCell("Descanso(s)");
        table.addCell("Estado");

        for (RutinaEjercicio re : ejercicios) {
            table.addCell(re.getEjercicio().getNombre());
            table.addCell(re.getSeries() != null ? re.getSeries().toString() : "");
            table.addCell(re.getRepeticiones() != null ? re.getRepeticiones().toString() : "");
            table.addCell(re.getDescanso_segundos() != null ? re.getDescanso_segundos().toString() : "");
            table.addCell(re.getEstado() != null ? re.getEstado().getNombre() : "");
        }

        document.add(table);
        document.close();
    }
}
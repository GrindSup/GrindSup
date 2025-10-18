package com.grindsup.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grindsup.backend.DTO.CrearRutinarequestDTO;
import com.grindsup.backend.DTO.EjercicioRutinaDTO;
import com.grindsup.backend.model.Ejercicio;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.model.RutinaEjercicio;
import com.grindsup.backend.repository.EjercicioRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.PlanEntrenamientoRepository;
import com.grindsup.backend.repository.RutinaEjercicioRepository;
import com.grindsup.backend.repository.RutinaRepository;

@RestController
@RequestMapping("/api/planes/{idPlan}/rutinas")
public class PlanRutinaController {

    @Autowired
    private PlanEntrenamientoRepository planRepository;

    @Autowired
    private RutinaRepository rutinaRepository;

    @Autowired
    private RutinaEjercicioRepository rutinaEjercicioRepository;

    @Autowired
    private EjercicioRepository ejercicioRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    // ==========================
    // Crear Rutina con ejercicios
    // ==========================
    // @PostMapping("/{idPlan}/rutinas")
    // public ResponseEntity<Rutina> crearRutina(
    //     @PathVariable Long idPlan,
    //     @RequestBody CrearRutinarequestDTO request) {

    //     // Buscar plan
    //     PlanEntrenamiento plan = planRepository.findById(idPlan)
    //             .orElseThrow(() -> new RuntimeException("Plan no encontrado"));

    //     // Crear rutina
    //     Rutina rutina = new Rutina();
    //     rutina.setNombre(request.getNombre());
    //     rutina.setDescripcion(request.getDescripcion());
    //     rutina.setPlan(plan);

    //     // Asignar estado por defecto
    //     Estado estado = estadoRepository.findById(1L)
    //             .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
    //     rutina.setEstado(estado);

    //     // Guardar rutina
    //     Rutina nuevaRutina = rutinaRepository.save(rutina);

    //     // Guardar ejercicios asociados
    //     if (request.getEjercicios() != null) {
    //         for (EjercicioRutinaDTO dto : request.getEjercicios()) {
    //             RutinaEjercicio re = new RutinaEjercicio();
    //             re.setRutina(nuevaRutina);

    //             // ⚠️ Cambiado para usar tu DTO
    //             Ejercicio ejercicio = ejercicioRepository.findById(dto.getIdEjercicio())
    //                     .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));
    //             re.setEjercicio(ejercicio);

    //             re.setSeries(dto.getSeries());
    //             re.setRepeticiones(dto.getRepeticiones());
    //             re.setDescanso_segundos(dto.getDescansoSegundos()); // ahora coincide con el DTO

    //             re.setEstado(estado); // mismo estado por defecto
    //             rutinaEjercicioRepository.save(re);
    //         }
    //     }

    //     return ResponseEntity.ok(nuevaRutina);
    // }

    // ==========================
    // Listar rutinas de un plan
    // ==========================
    @GetMapping
    public List<Rutina> listarRutinasPorPlan(@PathVariable Long idPlan) {
        PlanEntrenamiento plan = planRepository.findById(idPlan)
                .orElseThrow(() -> new RuntimeException("Plan no encontrado"));
        return rutinaRepository.findAll()
                .stream()
                .filter(r -> r.getPlan().getId_plan().equals(plan.getId_plan()))
                .toList();
    }

    // ==========================
    // Obtener detalle de rutina
    // ==========================
    @GetMapping("/{idRutina}/detalle")
    public ResponseEntity<?> getRutinaDetalle(@PathVariable Long idPlan, @PathVariable Long idRutina) {
        Rutina rutina = rutinaRepository.findById(idRutina)
                .orElseThrow(() -> new RuntimeException("Rutina no encontrada"));

        if (!rutina.getPlan().getId_plan().equals(idPlan)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("La rutina no pertenece al plan indicado");
        }

        List<RutinaEjercicio> ejercicios = rutinaEjercicioRepository.findAll()
                .stream()
                .filter(re -> re.getRutina().getId_rutina().equals(idRutina) && re.getDeleted_at() == null)
                .toList();

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("rutina", rutina);
        resultado.put("ejercicios", ejercicios);

        return ResponseEntity.ok(resultado);
    }
}

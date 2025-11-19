// src/main/java/com/grindsup/backend/controller/AdminEntrenadorReportController.java
package com.grindsup.backend.controller;

import com.grindsup.backend.DTO.EntrenadorUsoGlobalDTO;
import com.grindsup.backend.DTO.EntrenadorStatsDTO;
import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.model.Sesion;
import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.repository.EntrenadorRepository;
import com.grindsup.backend.repository.SesionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
// 🔴 OJO: por ahora SIN PreAuthorize
// import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reportes/admin/entrenadores")
@CrossOrigin(origins = "*")
public class AdminEntrenadorReportController {

    @Autowired
    private EntrenadorRepository entrenadorRepository;

    @Autowired
    private SesionRepository sesionRepository;

    @GetMapping("/uso-global")
    public ResponseEntity<EntrenadorUsoGlobalDTO> reporteUsoGlobal() {

        List<Entrenador> entrenadores = entrenadorRepository.findAll()
                .stream()
                .filter(e -> e.getDeleted_at() == null)
                .collect(Collectors.toList());

        EntrenadorUsoGlobalDTO dto = new EntrenadorUsoGlobalDTO();
        dto.setTotalEntrenadores(entrenadores.size());

        if (entrenadores.isEmpty()) {
            dto.setTotalSesiones(0);
            dto.setTotalSesionesUltimos30Dias(0);
            dto.setPromedioSesionesPorEntrenador(0.0);
            dto.setEntrenadoresMasActivos(List.of());
            return ResponseEntity.ok(dto);
        }

        List<Usuario> usuarios = entrenadores.stream()
                .map(Entrenador::getUsuario)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<Sesion> sesiones = sesionRepository.findByUsuarios(usuarios);

        long totalSesiones = sesiones.size();
        dto.setTotalSesiones(totalSesiones);

        OffsetDateTime desde = OffsetDateTime.now().minusDays(30);
        dto.setDesdeUltimos30Dias(desde);

        long sesionesUltimos30 = sesiones.stream()
                .filter(s -> s.getInicio() != null && !s.getInicio().isBefore(desde))
                .count();
        dto.setTotalSesionesUltimos30Dias(sesionesUltimos30);

        double promedio = entrenadores.isEmpty()
                ? 0.0
                : (double) totalSesiones / (double) entrenadores.size();
        dto.setPromedioSesionesPorEntrenador(promedio);

        Map<Long, List<Sesion>> sesionesPorUsuario = sesiones.stream()
                .filter(s -> s.getUsuario() != null)
                .collect(Collectors.groupingBy(s -> s.getUsuario().getId_usuario()));

        List<EntrenadorUsoGlobalDTO.ItemEntrenadorActivoDTO> items = new ArrayList<>();

        for (Entrenador ent : entrenadores) {
            Usuario u = ent.getUsuario();
            if (u == null) continue;

            List<Sesion> ses = sesionesPorUsuario.getOrDefault(u.getId_usuario(), List.of());
            if (ses.isEmpty()) continue;

            EntrenadorUsoGlobalDTO.ItemEntrenadorActivoDTO item =
                    new EntrenadorUsoGlobalDTO.ItemEntrenadorActivoDTO();
            item.setIdEntrenador(ent.getIdEntrenador());
            item.setIdUsuario(u.getId_usuario());
            item.setNombre(u.getNombre());
            item.setApellido(u.getApellido());
            item.setTotalSesiones(ses.size());

            OffsetDateTime ultimo = ses.stream()
                    .map(Sesion::getInicio)
                    .filter(Objects::nonNull)
                    .max(OffsetDateTime::compareTo)
                    .orElse(null);
            item.setUltimoAcceso(ultimo);

            items.add(item);
        }

        items.sort(Comparator.comparingLong(
                EntrenadorUsoGlobalDTO.ItemEntrenadorActivoDTO::getTotalSesiones
        ).reversed());

        dto.setEntrenadoresMasActivos(items.stream().limit(5).toList());

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<EntrenadorStatsDTO> reporteEstadisticas(
            @RequestParam(name = "inactividadDias", defaultValue = "30") long inactividadDias
    ) {
        List<Entrenador> entrenadores = entrenadorRepository.findAll()
                .stream()
                .filter(e -> e.getDeleted_at() == null)
                .collect(Collectors.toList());

        EntrenadorStatsDTO dto = new EntrenadorStatsDTO();
        dto.setTotalEntrenadores(entrenadores.size());

        if (entrenadores.isEmpty()) {
            dto.setNuevosUltimos30Dias(0);
            dto.setFechaUltimoEntrenadorCreado(null);
            dto.setEntrenadoresInactivos(List.of());
            return ResponseEntity.ok(dto);
        }

        OffsetDateTime ahora = OffsetDateTime.now();
        OffsetDateTime hace30 = ahora.minusDays(30);
        OffsetDateTime limiteInactivo = ahora.minusDays(inactividadDias);

        long nuevos30 = entrenadores.stream()
                .filter(e -> e.getCreated_at() != null && !e.getCreated_at().isBefore(hace30))
                .count();
        dto.setNuevosUltimos30Dias(nuevos30);

        OffsetDateTime ultimoCreado = entrenadores.stream()
                .map(Entrenador::getCreated_at)
                .filter(Objects::nonNull)
                .max(OffsetDateTime::compareTo)
                .orElse(null);
        dto.setFechaUltimoEntrenadorCreado(ultimoCreado);

        List<EntrenadorStatsDTO.EntrenadorInactivoDTO> inactivos = new ArrayList<>();

        for (Entrenador ent : entrenadores) {
            Usuario u = ent.getUsuario();
            if (u == null) continue;

            List<Sesion> sesiones = sesionRepository.findByUsuario(u);
            OffsetDateTime ultimoAcceso = sesiones.stream()
                    .map(Sesion::getInicio)
                    .filter(Objects::nonNull)
                    .max(OffsetDateTime::compareTo)
                    .orElse(null);

            boolean esInactivo;
            if (ultimoAcceso == null) {
                esInactivo = ent.getCreated_at() != null && ent.getCreated_at().isBefore(limiteInactivo);
            } else {
                esInactivo = ultimoAcceso.isBefore(limiteInactivo);
            }

            if (esInactivo) {
                EntrenadorStatsDTO.EntrenadorInactivoDTO item =
                        new EntrenadorStatsDTO.EntrenadorInactivoDTO();
                item.setIdEntrenador(ent.getIdEntrenador());
                item.setIdUsuario(u.getId_usuario());
                item.setNombre(u.getNombre());
                item.setApellido(u.getApellido());
                item.setUltimoAcceso(ultimoAcceso);
                long dias = (ultimoAcceso == null)
                        ? Duration.between(ent.getCreated_at(), ahora).toDays()
                        : Duration.between(ultimoAcceso, ahora).toDays();
                item.setDiasSinEntrar(dias);
                inactivos.add(item);
            }
        }

        inactivos.sort(Comparator.comparingLong(
                EntrenadorStatsDTO.EntrenadorInactivoDTO::getDiasSinEntrar
        ).reversed());
        dto.setEntrenadoresInactivos(inactivos);

        return ResponseEntity.ok(dto);
    }
}

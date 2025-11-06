package com.grindsup.backend.controller;

import com.grindsup.backend.model.Sesion;
import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.SesionRepository;
import com.grindsup.backend.repository.UsuarioRepository;
import com.grindsup.backend.repository.EstadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sesiones")
public class SesionController {

    @Autowired
    private SesionRepository sesionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @GetMapping
    public List<Sesion> getAll() {
        return sesionRepository.findAll();
    }

    @GetMapping("/{id}")
    public Sesion getById(@PathVariable Long id) {
        return sesionRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Sesion create(@RequestBody Sesion sesion) {
        if (sesion.getUsuario() != null) {
            Usuario usuario = usuarioRepository.findById(sesion.getUsuario().getId_usuario()).orElse(null);
            sesion.setUsuario(usuario);
        }
        if (sesion.getEstado() != null) {
            Estado estado = estadoRepository.findById(sesion.getEstado().getIdEstado()).orElse(null);
            sesion.setEstado(estado);
        }
        return sesionRepository.save(sesion);
    }

    @PutMapping("/{id}")
    public Sesion update(@PathVariable Long id, @RequestBody Sesion sesion) {
        return sesionRepository.findById(id).map(existing -> {
            existing.setInicio(sesion.getInicio());
            existing.setFin(sesion.getFin());
            existing.setIp(sesion.getIp());
            existing.setDispositivo(sesion.getDispositivo());

            if (sesion.getUsuario() != null) {
                Usuario usuario = usuarioRepository.findById(sesion.getUsuario().getId_usuario()).orElse(null);
                existing.setUsuario(usuario);
            }
            if (sesion.getEstado() != null) {
                Estado estado = estadoRepository.findById(sesion.getEstado().getIdEstado()).orElse(null);
                existing.setEstado(estado);
            }
            return sesionRepository.save(existing);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        sesionRepository.deleteById(id);
        return "Sesion eliminada con id " + id;
    }
}

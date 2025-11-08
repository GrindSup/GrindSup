package com.grindsup.backend.controller;

import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.EntrenadorRepository;
import com.grindsup.backend.repository.UsuarioRepository;
import com.grindsup.backend.repository.EstadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entrenadores")
public class EntrenadorController {

    @Autowired
    private EntrenadorRepository entrenadorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @GetMapping
    public List<Entrenador> getAll() {
        return entrenadorRepository.findAll();
    }

    @GetMapping("/{id}")
    public Entrenador getById(@PathVariable Long id) {
        return entrenadorRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Entrenador create(@RequestBody Entrenador entrenador) {
        if (entrenador.getUsuario() != null) {
            Usuario usuario = usuarioRepository.findById(entrenador.getUsuario().getId_usuario()).orElse(null);
            entrenador.setUsuario(usuario);
        }
        if (entrenador.getEstado() != null) {
            Estado estado = estadoRepository.findById(entrenador.getEstado().getIdEstado()).orElse(null);
            entrenador.setEstado(estado);
        }
        return entrenadorRepository.save(entrenador);
    }

    @PutMapping("/{id}")
    public Entrenador update(@PathVariable Long id, @RequestBody Entrenador entrenador) {
        return entrenadorRepository.findById(id).map(existing -> {
            existing.setExperiencia(entrenador.getExperiencia());
            existing.setTelefono(entrenador.getTelefono());

            if (entrenador.getUsuario() != null) {
                Usuario usuario = usuarioRepository.findById(entrenador.getUsuario().getId_usuario()).orElse(null);
                existing.setUsuario(usuario);
            }
            if (entrenador.getEstado() != null) {
                Estado estado = estadoRepository.findById(entrenador.getEstado().getIdEstado()).orElse(null);
                existing.setEstado(estado);
            }
            return entrenadorRepository.save(existing);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        entrenadorRepository.deleteById(id);
        return "Entrenador eliminado con id " + id;
    }
}

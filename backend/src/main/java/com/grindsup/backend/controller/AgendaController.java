package com.grindsup.backend.controller;

import com.grindsup.backend.model.Agenda;
import com.grindsup.backend.model.Turno;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.AgendaRepository;
import com.grindsup.backend.repository.TurnoRepository;
import com.grindsup.backend.repository.EstadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agendas")
public class AgendaController {

    @Autowired
    private AgendaRepository agendaRepository;

    @Autowired
    private TurnoRepository turnoRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @GetMapping
    public List<Agenda> getAll() {
        return agendaRepository.findAll();
    }

    @GetMapping("/{id}")
    public Agenda getById(@PathVariable Long id) {
        return agendaRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Agenda create(@RequestBody Agenda agenda) {
        if (agenda.getTurno() != null) {
            Turno turno = turnoRepository.findById(agenda.getTurno().getId_turno()).orElse(null);
            agenda.setTurno(turno);
        }
        if (agenda.getEstado() != null) {
            Estado estado = estadoRepository.findById(agenda.getEstado().getIdEstado()).orElse(null);
            agenda.setEstado(estado);
        }
        return agendaRepository.save(agenda);
    }

    @PutMapping("/{id}")
    public Agenda update(@PathVariable Long id, @RequestBody Agenda agenda) {
        return agendaRepository.findById(id).map(existing -> {
            if (agenda.getTurno() != null) {
                Turno turno = turnoRepository.findById(agenda.getTurno().getId_turno()).orElse(null);
                existing.setTurno(turno);
            }
            if (agenda.getEstado() != null) {
                Estado estado = estadoRepository.findById(agenda.getEstado().getIdEstado()).orElse(null);
                existing.setEstado(estado);
            }
            return agendaRepository.save(existing);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        agendaRepository.deleteById(id);
        return "Agenda eliminada con id " + id;
    }
}

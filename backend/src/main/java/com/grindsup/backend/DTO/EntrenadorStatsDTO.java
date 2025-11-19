package com.grindsup.backend.DTO;

import java.time.OffsetDateTime;
import java.util.List;

public class EntrenadorStatsDTO {

    private long totalEntrenadores;
    private long nuevosUltimos30Dias;
    private OffsetDateTime fechaUltimoEntrenadorCreado;
    private List<EntrenadorInactivoDTO> entrenadoresInactivos;

    // ====== Getters y setters ======

    public long getTotalEntrenadores() {
        return totalEntrenadores;
    }

    public void setTotalEntrenadores(long totalEntrenadores) {
        this.totalEntrenadores = totalEntrenadores;
    }

    public long getNuevosUltimos30Dias() {
        return nuevosUltimos30Dias;
    }

    public void setNuevosUltimos30Dias(long nuevosUltimos30Dias) {
        this.nuevosUltimos30Dias = nuevosUltimos30Dias;
    }

    public OffsetDateTime getFechaUltimoEntrenadorCreado() {
        return fechaUltimoEntrenadorCreado;
    }

    public void setFechaUltimoEntrenadorCreado(OffsetDateTime fechaUltimoEntrenadorCreado) {
        this.fechaUltimoEntrenadorCreado = fechaUltimoEntrenadorCreado;
    }

    public List<EntrenadorInactivoDTO> getEntrenadoresInactivos() {
        return entrenadoresInactivos;
    }

    public void setEntrenadoresInactivos(List<EntrenadorInactivoDTO> entrenadoresInactivos) {
        this.entrenadoresInactivos = entrenadoresInactivos;
    }

    // ====== Clase interna para entrenadores inactivos ======

    public static class EntrenadorInactivoDTO {
        private Long idEntrenador;
        private Long idUsuario;
        private String nombre;
        private String apellido;
        private OffsetDateTime ultimoAcceso;
        private long diasSinEntrar;

        public Long getIdEntrenador() {
            return idEntrenador;
        }

        public void setIdEntrenador(Long idEntrenador) {
            this.idEntrenador = idEntrenador;
        }

        public Long getIdUsuario() {
            return idUsuario;
        }

        public void setIdUsuario(Long idUsuario) {
            this.idUsuario = idUsuario;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public String getApellido() {
            return apellido;
        }

        public void setApellido(String apellido) {
            this.apellido = apellido;
        }

        public OffsetDateTime getUltimoAcceso() {
            return ultimoAcceso;
        }

        public void setUltimoAcceso(OffsetDateTime ultimoAcceso) {
            this.ultimoAcceso = ultimoAcceso;
        }

        public long getDiasSinEntrar() {
            return diasSinEntrar;
        }

        public void setDiasSinEntrar(long diasSinEntrar) {
            this.diasSinEntrar = diasSinEntrar;
        }
    }
}

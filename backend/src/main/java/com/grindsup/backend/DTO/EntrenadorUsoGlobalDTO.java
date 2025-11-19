package com.grindsup.backend.DTO;

import java.time.OffsetDateTime;
import java.util.List;

public class EntrenadorUsoGlobalDTO {

    // ---- métricas globales ----
    private long totalEntrenadores;
    private long totalSesiones;
    private long totalSesionesUltimos30Dias;
    private double promedioSesionesPorEntrenador;
    private OffsetDateTime desdeUltimos30Dias;

    // top 5 entrenadores más activos
    private List<ItemEntrenadorActivoDTO> entrenadoresMasActivos;

    // ========== getters / setters ==========

    public long getTotalEntrenadores() {
        return totalEntrenadores;
    }

    public void setTotalEntrenadores(long totalEntrenadores) {
        this.totalEntrenadores = totalEntrenadores;
    }

    public long getTotalSesiones() {
        return totalSesiones;
    }

    public void setTotalSesiones(long totalSesiones) {
        this.totalSesiones = totalSesiones;
    }

    public long getTotalSesionesUltimos30Dias() {
        return totalSesionesUltimos30Dias;
    }

    public void setTotalSesionesUltimos30Dias(long totalSesionesUltimos30Dias) {
        this.totalSesionesUltimos30Dias = totalSesionesUltimos30Dias;
    }

    public double getPromedioSesionesPorEntrenador() {
        return promedioSesionesPorEntrenador;
    }

    public void setPromedioSesionesPorEntrenador(double promedioSesionesPorEntrenador) {
        this.promedioSesionesPorEntrenador = promedioSesionesPorEntrenador;
    }

    public OffsetDateTime getDesdeUltimos30Dias() {
        return desdeUltimos30Dias;
    }

    public void setDesdeUltimos30Dias(OffsetDateTime desdeUltimos30Dias) {
        this.desdeUltimos30Dias = desdeUltimos30Dias;
    }

    public List<ItemEntrenadorActivoDTO> getEntrenadoresMasActivos() {
        return entrenadoresMasActivos;
    }

    public void setEntrenadoresMasActivos(List<ItemEntrenadorActivoDTO> entrenadoresMasActivos) {
        this.entrenadoresMasActivos = entrenadoresMasActivos;
    }

    // ======================================
    //   Clase interna para el TOP de activos
    // ======================================

    public static class ItemEntrenadorActivoDTO {
        private Long idEntrenador;
        private Long idUsuario;
        private String nombre;
        private String apellido;
        private long totalSesiones;
        private OffsetDateTime ultimoAcceso;

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

        public long getTotalSesiones() {
            return totalSesiones;
        }

        public void setTotalSesiones(long totalSesiones) {
            this.totalSesiones = totalSesiones;
        }

        public OffsetDateTime getUltimoAcceso() {
            return ultimoAcceso;
        }

        public void setUltimoAcceso(OffsetDateTime ultimoAcceso) {
            this.ultimoAcceso = ultimoAcceso;
        }
    }
}

package com.grindsup.backend.model;

import java.io.Serializable;
import java.util.Objects;

public class TurnoAlumnoId implements Serializable {
    private Long turno;
    private Long alumno;

    public TurnoAlumnoId() {
    }

    public TurnoAlumnoId(Long turno, Long alumno) {
        this.turno = turno;
        this.alumno = alumno;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof TurnoAlumnoId))
            return false;
        TurnoAlumnoId that = (TurnoAlumnoId) o;
        return Objects.equals(turno, that.turno) &&
                Objects.equals(alumno, that.alumno);
    }

    @Override
    public int hashCode() {
        return Objects.hash(turno, alumno);
    }
}
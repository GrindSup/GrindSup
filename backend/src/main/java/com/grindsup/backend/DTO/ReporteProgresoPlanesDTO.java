package com.grindsup.backend.DTO;

public class ReporteProgresoPlanesDTO {
    private Long idAlumno;
    private String nombreAlumno;
    private float totalRutinas;
    private float completadas;
    private float incompletas;
    private float enProceso;
    private float porcentajeCumplimiento;
    private Long entrenadorId;
    private String entrenadorNombre;
    private String entrenadorCorreo;
    private String entrenadorTelefono;

    public ReporteProgresoPlanesDTO(Long id_alumno,
            String nomAlumno,
            float total,
            float totalCompletas,
            float totalIncompletas,
            float totalEnProceso,
            float porcentaje,
            Long entrenadorId,
            String entrenadorNombre,
            String entrenadorCorreo,
            String entrenadorTelefono) {
        idAlumno = id_alumno;
        nombreAlumno = nomAlumno;
        totalRutinas = total;
        completadas = totalCompletas;
        incompletas = totalIncompletas;
        enProceso = totalEnProceso;
        porcentajeCumplimiento = porcentaje;
        this.entrenadorId = entrenadorId;
        this.entrenadorNombre = entrenadorNombre;
        this.entrenadorCorreo = entrenadorCorreo;
        this.entrenadorTelefono = entrenadorTelefono;

    }
    public float getCompletadas() {
        return completadas;
    }
    public void setCompletadas(float completadas) {
        this.completadas = completadas;
    }

    public float getIncompletas() {
        return incompletas;
    }
    public void setIncompletas(float incompletas) {
        this.incompletas = incompletas;
    }
    public Long getIdAlumno() {
        return idAlumno;
    }
    public void setIdAlumno(Long idAlumno) {
        this.idAlumno = idAlumno;
    }
    public String getNombreAlumno() {
        return nombreAlumno;
    }
    public void setNombreAlumno(String nombreAlumno) {
        this.nombreAlumno = nombreAlumno;
    }
    public float getTotalRutinas() {
        return totalRutinas;
    }
    public void setTotalRutinas(float totalRutinas) {
        this.totalRutinas = totalRutinas;
    }
    public float getEnProceso() {
        return enProceso;
    }
    public void setEnProceso(float enProceso) {
        this.enProceso = enProceso;
    }
    public float getPorcentajeCumplimiento() {
        return porcentajeCumplimiento;
    }
    public void setPorcentajeCumplimiento(float porcentajeCumplimiento) {
        this.porcentajeCumplimiento = porcentajeCumplimiento;
    }
    public Long getEntrenadorId() {
        return entrenadorId;
    }
    public void setEntrenadorId(Long entrenadorId) {
        this.entrenadorId = entrenadorId;
    }
    public String getEntrenadorNombre() {
        return entrenadorNombre;
    }
    public void setEntrenadorNombre(String entrenadorNombre) {
        this.entrenadorNombre = entrenadorNombre;
    }
    public String getEntrenadorCorreo() {
        return entrenadorCorreo;
    }
    public void setEntrenadorCorreo(String entrenadorCorreo) {
        this.entrenadorCorreo = entrenadorCorreo;
    }
    public String getEntrenadorTelefono() {
        return entrenadorTelefono;
    }
    public void setEntrenadorTelefono(String entrenadorTelefono) {
        this.entrenadorTelefono = entrenadorTelefono;
    }
}

package com.grindsup.backend.DTO;

public class ReporteProgresoPlanesDTO {
    private Long idAlumno;
    private String nombreAlumno;
    private float totalRutinas;
    private float completadas;
    private float incompletas;
    private float enProceso;
    private float porcentajeCumplimiento;

    public ReporteProgresoPlanesDTO(Long id_alumno, String nomAlumno, float total, float totalCompletas, float totalIncompletas,
            float totalEnProceso, float porcentaje) {
        idAlumno = id_alumno;
        nombreAlumno = nomAlumno;
        totalRutinas = total;
        completadas = totalCompletas;
        incompletas = totalIncompletas;
        enProceso = totalEnProceso;
        porcentajeCumplimiento = porcentaje;

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
}

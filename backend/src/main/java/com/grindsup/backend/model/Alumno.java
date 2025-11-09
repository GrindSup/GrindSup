package com.grindsup.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "alumnos", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "documento", "idEntrenador" })
})
public class Alumno {

    // @Id
    // @GeneratedValue(strategy = GenerationType.IDENTITY)
    // private Long id_alumno;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alumno")
    private Long idAlumno;

    @ManyToOne
    @JoinColumn(name = "id_entrenador", nullable = true)
    private Entrenador entrenador;

    @ManyToMany(mappedBy = "alumnos")
    private List<Turno> turnos = new ArrayList<>();

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 100)
    private String apellido;

    // ⬇️ QUITAR unique = true
    @Column(nullable = false, length = 20)
    private String documento;

    @Column(length = 50)
    private String telefono;

    @Column(name = "fecha_nacimiento")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaNacimiento;

    @Column
    private Double peso;

    @Column
    private Double altura;

    @Column(columnDefinition = "TEXT")
    private String lesiones;

    @Column(columnDefinition = "TEXT")
    private String enfermedades;

    @Column(name = "informe_medico", nullable = false)
    private Boolean informeMedico = false;

    @ManyToOne
    @JoinColumn(name = "id_estado")
    private Estado estado;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime created_at;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updated_at;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "motivo_baja", columnDefinition = "TEXT")
    private String motivoBaja;

    // getters & setters ...

    // ====== Getters y Setters ======
    // public Long getId_alumno() { return id_alumno; }
    // public void setId_alumno(Long id_alumno) { this.id_alumno = id_alumno; }
    public Long getId_alumno() {
        return idAlumno;
    }

    public void setId_alumno(Long id_alumno) {
        this.idAlumno = id_alumno;
    }

    public Entrenador getEntrenador() {
        return entrenador;
    }

    public void setEntrenador(Entrenador entrenador) {
        this.entrenador = entrenador;
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

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public Double getAltura() {
        return altura;
    }

    public void setAltura(Double altura) {
        this.altura = altura;
    }

    public String getLesiones() {
        return lesiones;
    }

    public void setLesiones(String lesiones) {
        this.lesiones = lesiones;
    }

    public String getEnfermedades() {
        return enfermedades;
    }

    public void setEnfermedades(String enfermedades) {
        this.enfermedades = enfermedades;
    }

    public Boolean getInformeMedico() {
        return informeMedico;
    }

    public void setInformeMedico(Boolean informeMedico) {
        this.informeMedico = informeMedico;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    public OffsetDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(OffsetDateTime created_at) {
        this.created_at = created_at;
    }

    public OffsetDateTime getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(OffsetDateTime updated_at) {
        this.updated_at = updated_at;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public String getMotivoBaja() {
        return motivoBaja;
    }

    public void setMotivoBaja(String motivoBaja) {
        this.motivoBaja = motivoBaja;
    }
}

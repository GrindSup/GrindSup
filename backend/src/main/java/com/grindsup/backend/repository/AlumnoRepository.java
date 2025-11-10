package com.grindsup.backend.repository;

import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.DTO.AlumnoListDTO; // <-- ¡Nueva Importación!
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface AlumnoRepository extends JpaRepository<Alumno, Long> {

    // ---- Proyección para métricas (altas/bajas por mes)
    interface MesCount {
        String getMonth();
        Long getCnt();
    }

    // Solo activos (sin baja lógica)
    List<Alumno> findByDeletedAtIsNull();

    // Solo eliminados
    List<Alumno> findByDeletedAtIsNotNull();

    // 🔹 Nuevo método para buscar solo alumnos activos por DNI
    Optional<Alumno> findByDocumentoAndDeletedAtIsNull(String documento);

    Optional<Alumno> findByDocumento(String documento);

    // Mantenemos el método que devuelve la entidad Alumno completa (por si es usado en otro lado, ej: create/update/findById)
    @Query("""
        select a
        from Alumno a
        where a.deletedAt is null
          and a.entrenador.idEntrenador = :entrenadorId
        """)
    List<Alumno> findActivosByEntrenador(@Param("entrenadorId") Long entrenadorId);


    // 🏆 MÉTODO CORREGIDO: Proyección para listado simple (15 CAMPOS)
    @Query("""
        SELECT new com.grindsup.backend.DTO.AlumnoListDTO(
             a.idAlumno, a.nombre, a.apellido, a.documento,
             a.telefono, 
             a.peso, a.altura, a.lesiones, a.enfermedades, a.informeMedico, 
             a.estado.idEstado, a.estado.nombre, 
             a.entrenador.idEntrenador, a.created_at, a.updated_at 
        )
        FROM Alumno a
        WHERE a.deletedAt IS NULL
          AND a.entrenador.idEntrenador = :entrenadorId
        """)
    List<AlumnoListDTO> findActivosDTOByEntrenador(@Param("entrenadorId") Long entrenadorId);

    // ====== MÉTRICAS: ALTAS / BAJAS POR MES (native SQL, sin migraciones) ======

    // ALTAS por mes (usando created_at)
    @Query(value = """
          SELECT DATE_FORMAT(a.created_at, '%Y-%m') AS month,
                  COUNT(*) AS cnt
          FROM alumnos a
          WHERE a.id_entrenador = :entrenadorId
            AND a.created_at BETWEEN :from AND :to
          GROUP BY month
          ORDER BY month
          """, nativeQuery = true)
    List<MesCount> altasPorMes(
        @Param("entrenadorId") Long entrenadorId,
        @Param("from") Date from,
        @Param("to")   Date to
    );

    // BAJAS por mes (aprox): usa deleted_at o cambio a estado INACTIVO en el rango
    // ⚠️ Si INACTIVO no es 2 en tu catálogo, cambiá ese valor.
    @Query(value = """
          SELECT DATE_FORMAT(COALESCE(a.deleted_at, a.updated_at), '%Y-%m') AS month,
                  COUNT(*) AS cnt
          FROM alumnos a
          WHERE a.id_entrenador = :entrenadorId
            AND (
                  (a.deleted_at IS NOT NULL AND a.deleted_at BETWEEN :from AND :to)
                  OR (a.id_estado = 2 AND a.updated_at BETWEEN :from AND :to)
                )
          GROUP BY month
          ORDER BY month
          """, nativeQuery = true)
    List<MesCount> bajasPorMes(
        @Param("entrenadorId") Long entrenadorId,
        @Param("from") Date from,
        @Param("to")   Date to
    );

    // ====== MÉTRICA: Activos hasta una fecha (corte exclusivo) ======
    @Query(value = """
          SELECT COUNT(*)
          FROM alumnos a
          WHERE a.id_entrenador = :entrenadorId
            AND a.created_at < :corteExclusivo
            AND (a.deleted_at IS NULL OR a.deleted_at >= :corteExclusivo)
          """, nativeQuery = true)
    Long countActivosAntesDe(
        @Param("entrenadorId") Long entrenadorId,
        @Param("corteExclusivo") java.util.Date corteExclusivo
    );

    // Activos HASTA una fecha dada (created_at <= fecha y no dados de baja antes/en esa fecha)
    @Query(value = """
          SELECT COUNT(*)
          FROM alumnos a
          WHERE a.id_entrenador = :entrenadorId
            AND a.created_at <= :fecha
            AND (a.deleted_at IS NULL OR a.deleted_at > :fecha)
          """, nativeQuery = true)
    Long countActivosHasta(
        @Param("entrenadorId") Long entrenadorId,
        @Param("fecha") java.util.Date fecha
    );
}
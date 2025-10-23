package com.grindsup.backend.repository;

import com.grindsup.backend.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {

    // Consulta optimizada para carga general
    @Query("""
           SELECT t
           FROM Turno t
           JOIN FETCH t.entrenador
           JOIN FETCH t.tipoTurno
           ORDER BY t.fecha
           """)
    List<Turno> findAllWithEntrenadorAndTipoTurno();

    // Consulta principal para la API de Entrenador (filtra en BD)
    @Query("""
           SELECT t
           FROM Turno t
           JOIN FETCH t.entrenador e
           JOIN FETCH t.tipoTurno tt
           WHERE e.id_entrenador = :entrenadorId
             AND (:desde IS NULL OR t.fecha >= :desde)
             AND (:hasta IS NULL OR t.fecha <= :hasta)
             AND (:tipo IS NULL OR LOWER(tt.nombre) = LOWER(:tipo))
           ORDER BY t.fecha
           """)
    List<Turno> findByEntrenadorAndFilters(@Param("entrenadorId") Long entrenadorId,
                                           @Param("desde") OffsetDateTime desde,
                                           @Param("hasta") OffsetDateTime hasta,
                                           @Param("tipo") String tipo);
                                           
       List<Turno> findByEntrenador_Id(Long idEntrenador);
}

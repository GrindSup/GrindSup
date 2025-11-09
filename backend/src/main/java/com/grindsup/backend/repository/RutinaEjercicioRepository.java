package com.grindsup.backend.repository;

import com.grindsup.backend.model.RutinaEjercicio;
import com.grindsup.backend.model.RutinaEjercicioId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface RutinaEjercicioRepository extends JpaRepository<RutinaEjercicio, RutinaEjercicioId> {

    // Traer por el id_rutina
    @Query("SELECT re FROM RutinaEjercicio re WHERE re.rutina.id_rutina = :idRutina")
    List<RutinaEjercicio> findAllByRutinaId(@Param("idRutina") Long idRutina);

    // Traer solo los activos 
    @Query("SELECT re FROM RutinaEjercicio re WHERE re.rutina.id_rutina = :idRutina AND re.deleted_at IS NULL")
    List<RutinaEjercicio> findActivosByRutinaId(@Param("idRutina") Long idRutina);


    // Borrado físico por id_rutina 
    @Modifying
    @Transactional
    @Query("DELETE FROM RutinaEjercicio re WHERE re.rutina.id_rutina = :idRutina")
    void deleteAllByRutinaId(@Param("idRutina") Long idRutina);
}
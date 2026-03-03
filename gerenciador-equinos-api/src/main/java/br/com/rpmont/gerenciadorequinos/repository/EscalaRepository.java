package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.Escala;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EscalaRepository extends JpaRepository<Escala, Long> {

    @Query("SELECT e FROM Escala e JOIN FETCH e.equino")
    List<Escala> findAllWithEquino();

    @Query("SELECT e FROM Escala e JOIN FETCH e.equino WHERE e.id = :id")
    Optional<Escala> findByIdWithEquino(@Param("id") Long id);
}

package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.ResenhaDescritiva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResenhaDescritivaRepository extends JpaRepository<ResenhaDescritiva, Long> {

    Optional<ResenhaDescritiva> findByEquinoId(Long equinoId);
}

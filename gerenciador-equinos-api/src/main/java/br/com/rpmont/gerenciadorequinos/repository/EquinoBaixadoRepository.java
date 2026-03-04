package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.EquinoBaixado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquinoBaixadoRepository extends JpaRepository<EquinoBaixado, Long> {

    List<EquinoBaixado>findByEquinoIdOrderByDataBaixaDesc(Long equinoId);

    Optional<EquinoBaixado>findFirstByEquinoIdAndDataRetornoIsNullOrderByDataBaixaDesc(Long equinoId);
}

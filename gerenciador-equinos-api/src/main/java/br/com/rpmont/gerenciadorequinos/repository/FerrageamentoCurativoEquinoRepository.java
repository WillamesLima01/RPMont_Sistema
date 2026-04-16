package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.FerrageamentoCurativoEquino;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FerrageamentoCurativoEquinoRepository extends JpaRepository<FerrageamentoCurativoEquino, Long> {
}

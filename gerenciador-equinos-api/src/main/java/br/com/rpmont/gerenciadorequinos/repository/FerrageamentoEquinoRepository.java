package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.FerrageamentoEquino;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FerrageamentoEquinoRepository extends JpaRepository<FerrageamentoEquino, Long> {

}

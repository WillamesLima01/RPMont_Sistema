package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.FerrageamentoRepregoEquino;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FerrageamentoRepregoEquinoRepository extends JpaRepository<FerrageamentoRepregoEquino, Long> {
}

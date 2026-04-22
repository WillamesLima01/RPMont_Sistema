package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.EntradaMedicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntradaMedicamentoRepository extends JpaRepository<EntradaMedicamento, Long> {

    List<EntradaMedicamento> findByMedicamentoId(Long medicamentoId);
}

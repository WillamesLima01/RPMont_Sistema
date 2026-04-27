package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.SaidaMedicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaidaMedicamentoRepository extends JpaRepository<SaidaMedicamento, Long> {

    List<SaidaMedicamento> findByMedicamentoId(Long medicamentoId);
    List<SaidaMedicamento> findByEquinoId(Long equinoId);
    List<SaidaMedicamento> findByAtendimentoId(String atendimentoId);
}

package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.enums.FormaFarmaceuticaEnum;
import br.com.rpmont.gerenciadorequinos.enums.TipoApresentacaoEnum;
import br.com.rpmont.gerenciadorequinos.model.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {

    List<Medicamento> findByAtivoTrue();

    List<Medicamento> findByNomeContainingIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndFormaAndTipoApresentacao(
            String nome,
            FormaFarmaceuticaEnum forma,
            TipoApresentacaoEnum tipoApresentacao
    );
}

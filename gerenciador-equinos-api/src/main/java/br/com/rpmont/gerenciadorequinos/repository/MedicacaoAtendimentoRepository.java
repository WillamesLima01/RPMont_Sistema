package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.MedicacaoAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicacaoAtendimentoRepository extends JpaRepository<MedicacaoAtendimento, Long> {

    List<MedicacaoAtendimento> findByAtendimento_Id(Long atendimentoId);

    List<MedicacaoAtendimento> findByEquino_Id(Long equinoId);

    List<MedicacaoAtendimento> findByOrigem(br.com.rpmont.gerenciadorequinos.enums.OrigemMedicamentoEnum origem);
}
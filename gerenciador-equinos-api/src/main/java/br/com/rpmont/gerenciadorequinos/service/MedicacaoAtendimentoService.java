package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.MedicacaoAtendimentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.MedicacaoAtendimentoResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface MedicacaoAtendimentoService {

    MedicacaoAtendimentoResponse salvarMedicacaoAtendimento(MedicacaoAtendimentoRequest medicacaoAtendimentoRequest);

    MedicacaoAtendimentoResponse buscarMedicacaoAtendimentoId(Long id);

    List<MedicacaoAtendimentoResponse> listarTodasMedicacoesAtendimento();

    List<MedicacaoAtendimentoResponse> buscarMedicacoesPorAtendimentoId(Long atendimentoId);

    List<MedicacaoAtendimentoResponse> buscarMedicacoesPorEquinoId(Long equinoId);

    MedicacaoAtendimentoResponse atualizarMedicacaoAtendimentoId(Long id, MedicacaoAtendimentoRequest medicacaoAtendimentoRequest);

    void deletarMedicacaoAtendimentoId(Long id);
}
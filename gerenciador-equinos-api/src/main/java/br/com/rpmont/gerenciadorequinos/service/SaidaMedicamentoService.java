package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.SaidaMedicamentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.SaidaMedicamentoResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface SaidaMedicamentoService {

    SaidaMedicamentoResponse salvarSaidaMedicamento(SaidaMedicamentoRequest saidaMedicamentoRequest);

    SaidaMedicamentoResponse buscarSaidaMedicamentoId(Long id);

    List<SaidaMedicamentoResponse> listarTodasSaidasMedicamentos();

    List<SaidaMedicamentoResponse> buscarSaidasPorMedicamentosId(Long medicamentoId);

    List<SaidaMedicamentoResponse> buscarSaidaPorEquinoId(Long equino_id);

    List<SaidaMedicamentoResponse> buscarSaidasPorAtendimentosId(Long atendimentoId);

    SaidaMedicamentoResponse atualizarSaidamedicamentoId(Long id, SaidaMedicamentoRequest saidaMedicamentoRequest);

    void deletarSaidaMedicamentoId(Long id);
}

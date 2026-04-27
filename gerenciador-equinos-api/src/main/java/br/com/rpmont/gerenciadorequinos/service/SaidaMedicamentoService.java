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

    List<SaidaMedicamentoResponse> buscarSaidasPorMedicamentosId(Long medicamento_id);

    List<SaidaMedicamentoResponse> buscarSaidaPorEquinoId(Long equino_id);

    List<SaidaMedicamentoResponse> buscarSaidasPorAtendiemtnosId(String atendimento_id);

    SaidaMedicamentoResponse atualizarSaidamedicamentoId(Long id, SaidaMedicamentoRequest saidaMedicamentoRequest);

    void deletarSaidaMedicamentoId(Long id);
}

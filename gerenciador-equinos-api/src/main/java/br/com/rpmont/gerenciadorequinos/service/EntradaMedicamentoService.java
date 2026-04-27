package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.EntradaMedicamentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EntradaMedicamentoResponse;
import br.com.rpmont.gerenciadorequinos.model.EntradaMedicamento;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface EntradaMedicamentoService {

    EntradaMedicamentoResponse salvarEntradaMedicamento(EntradaMedicamentoRequest entradaMedicamentoRequest);

    EntradaMedicamentoResponse buscarEntradaMedicamentoId(Long id);

    List<EntradaMedicamentoResponse> ListarTodasEntradasMedicamento();

    List<EntradaMedicamentoResponse>buscarEntradaPorMedicamentoId(Long medicamentoId);

    EntradaMedicamentoResponse atualizarEntradaMedicamentoId(Long id, EntradaMedicamentoRequest entradaMedicamentoRequest);

    void deletarEntradaMedicamentoId(Long id);
}

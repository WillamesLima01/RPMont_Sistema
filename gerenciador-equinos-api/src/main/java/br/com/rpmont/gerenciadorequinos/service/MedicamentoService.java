package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.MedicamentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.MedicamentoResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface MedicamentoService {

    MedicamentoResponse salvarMedicamento(MedicamentoRequest medicamentoRequest);

    List<MedicamentoResponse> listarTodosMedicamentos();

    List<MedicamentoResponse> listarTodosMedicamentosAtivos();

    MedicamentoResponse buscarMedicamentoId(Long id);

    MedicamentoResponse atualizarMedicamentoId(Long id, MedicamentoRequest medicamentoRequest);

    void deletarMedicamentoId(Long id);

}

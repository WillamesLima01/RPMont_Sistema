package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.SaidaMedicamentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.SaidaMedicamentoResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.Medicamento;
import br.com.rpmont.gerenciadorequinos.repository.AtendimentosRepository;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.MedicamentoRepository;
import br.com.rpmont.gerenciadorequinos.repository.SaidaMedicamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SaidaMedicamentoServiceImpl implements SaidaMedicamentoService {

    private final SaidaMedicamentoRepository saidaMedicamentoRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final EquinoRepository equinoRepository;
    private final AtendimentosRepository atendimentosRepository;

    @Override
    public SaidaMedicamentoResponse salvarSaidaMedicamento(SaidaMedicamentoRequest saidaMedicamentoRequest) {
        Medicamento medicamentoExistente = medicamentoRepository.findById(saidaMedicamentoRequest.medicamentoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado no banco de dados."));

        Equino equinoExistente = equinoRepository.findById(saidaMedicamentoRequest.EquinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."));




        return null;
    }

    @Override
    public SaidaMedicamentoResponse buscarSaidaMedicamentoId(Long id) {
        return null;
    }

    @Override
    public List<SaidaMedicamentoResponse> listarTodasSaidasMedicamentos() {
        return List.of();
    }

    @Override
    public List<SaidaMedicamentoResponse> buscarSaidasPorMedicamentosId(Long medicamentoId) {
        return List.of();
    }

    @Override
    public List<SaidaMedicamentoResponse> buscarSaidaPorEquinoId(Long equinoId) {
        return List.of();
    }

    @Override
    public List<SaidaMedicamentoResponse> buscarSaidasPorAtendiemtnosId(String atendimentoId) {
        return List.of();
    }

    @Override
    public SaidaMedicamentoResponse atualizarSaidamedicamentoId(Long id, SaidaMedicamentoRequest saidaMedicamentoRequest) {
        return null;
    }

    @Override
    public void deletarSaidaMedicamentoId(Long id) {

    }
}

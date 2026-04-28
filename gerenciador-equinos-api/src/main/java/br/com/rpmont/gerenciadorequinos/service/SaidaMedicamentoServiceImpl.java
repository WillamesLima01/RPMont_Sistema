package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.SaidaMedicamentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.SaidaMedicamentoResponse;
import br.com.rpmont.gerenciadorequinos.model.Atendimentos;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.Medicamento;
import br.com.rpmont.gerenciadorequinos.model.SaidaMedicamento;
import br.com.rpmont.gerenciadorequinos.repository.AtendimentosRepository;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.MedicamentoRepository;
import br.com.rpmont.gerenciadorequinos.repository.SaidaMedicamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaidaMedicamentoServiceImpl implements SaidaMedicamentoService {

    private final SaidaMedicamentoRepository saidaMedicamentoRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final EquinoRepository equinoRepository;
    private final AtendimentosRepository atendimentosRepository;

    @Transactional
    @Override
    public SaidaMedicamentoResponse salvarSaidaMedicamento(SaidaMedicamentoRequest saidaMedicamentoRequest) {
        Medicamento medicamentoExistente = medicamentoRepository.findById(saidaMedicamentoRequest.medicamentoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado no banco de dados."));

        Atendimentos atendimentoExistente = atendimentosRepository.findById(saidaMedicamentoRequest.atendimentoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Atendimento não encontrado no banco de dados."));

        Equino equinoExistente = equinoRepository.findById(saidaMedicamentoRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."));

        SaidaMedicamento salvarSaidaMedicamento = new SaidaMedicamento();

        preencherDadosSaida(
                salvarSaidaMedicamento,
                saidaMedicamentoRequest,
                medicamentoExistente,
                atendimentoExistente,
                equinoExistente
        );

        SaidaMedicamento saidaMedicamentoSalva = saidaMedicamentoRepository.save(salvarSaidaMedicamento);

        return toResponse(saidaMedicamentoSalva);
    }

    @Transactional(readOnly = true)
    @Override
    public SaidaMedicamentoResponse buscarSaidaMedicamentoId(Long id) {

        SaidaMedicamento saidaMedicamentoExistente = saidaMedicamentoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Saída de medicamento não encontrada no banco de dados."));

        return toResponse(saidaMedicamentoExistente);
    }

    @Transactional(readOnly = true)
    @Override
    public List<SaidaMedicamentoResponse> listarTodasSaidasMedicamentos() {
        return saidaMedicamentoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<SaidaMedicamentoResponse> buscarSaidasPorMedicamentosId(Long medicamentoId) {
        return saidaMedicamentoRepository.findByMedicamentoId(medicamentoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<SaidaMedicamentoResponse> buscarSaidaPorEquinoId(Long equinoId) {
        return saidaMedicamentoRepository.findByEquinoId(equinoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<SaidaMedicamentoResponse> buscarSaidasPorAtendimentosId(Long atendimentoId) {
        return saidaMedicamentoRepository.findByAtendimentoId(atendimentoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @Override
    public SaidaMedicamentoResponse atualizarSaidamedicamentoId(Long id, SaidaMedicamentoRequest saidaMedicamentoRequest) {

        SaidaMedicamento saidaMedicamentoExistente = saidaMedicamentoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Saída de medicamento não encontrada no banco de dados."));

        Medicamento medicamentoExistente = medicamentoRepository.findById(saidaMedicamentoRequest.medicamentoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado no banco de dados."));

        Atendimentos atendimentoExistente = atendimentosRepository.findById(saidaMedicamentoRequest.atendimentoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Atendimento não encontrado no banco de dados."));

        Equino equinoExistente = equinoRepository.findById(saidaMedicamentoRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."));

        preencherDadosSaida(
                saidaMedicamentoExistente,
                saidaMedicamentoRequest,
                medicamentoExistente,
                atendimentoExistente,
                equinoExistente
        );

        SaidaMedicamento saidaAtualizada = saidaMedicamentoRepository.save(saidaMedicamentoExistente);

        return toResponse(saidaAtualizada);
    }

    @Transactional
    @Override
    public void deletarSaidaMedicamentoId(Long id) {
        SaidaMedicamento saidaMedicamentoExistente = saidaMedicamentoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Saída de medicamento não encontrada no banco de dados."));

        saidaMedicamentoRepository.delete(saidaMedicamentoExistente);
    }

    private void preencherDadosSaida(SaidaMedicamento saidaMedicamento, SaidaMedicamentoRequest saidaMedicamentoRequest,
                                     Medicamento medicamento, Atendimentos atendimento, Equino equino) {

        BigDecimal quantidadeBase = calcularQuantidadeBase(saidaMedicamentoRequest.quantidadeInformada());

        saidaMedicamento.setMedicamento(medicamento);
        saidaMedicamento.setMedicamentoNome(medicamento.getNome());
        saidaMedicamento.setFabricante(medicamento.getFabricante());

        saidaMedicamento.setAtendimento(atendimento);

        saidaMedicamento.setEquino(equino);
        saidaMedicamento.setEquinoNome(equino.getNome());

        saidaMedicamento.setTipoSaida(saidaMedicamentoRequest.tipoSaida());

        saidaMedicamento.setQuantidadeInformada(saidaMedicamentoRequest.quantidadeInformada());
        saidaMedicamento.setUnidadeInformada(saidaMedicamentoRequest.unidadeInformada());

        saidaMedicamento.setQuantidadeBase(quantidadeBase);
        saidaMedicamento.setUnidadeBase(medicamento.getUnidadeBase());

        saidaMedicamento.setDataSaida(saidaMedicamentoRequest.dataSaida());
        saidaMedicamento.setObservacao(saidaMedicamentoRequest.observacao());
    }

    private BigDecimal calcularQuantidadeBase(BigDecimal quantidadeInformada) {
        return quantidadeInformada;
    }

    private SaidaMedicamentoResponse toResponse(SaidaMedicamento saidaMedicamento) {
        return new SaidaMedicamentoResponse(
                saidaMedicamento.getId(),

                saidaMedicamento.getMedicamento().getId(),
                saidaMedicamento.getMedicamentoNome(),
                saidaMedicamento.getFabricante(),

                saidaMedicamento.getAtendimento().getId(),

                saidaMedicamento.getEquino().getId(),
                saidaMedicamento.getEquinoNome(),

                saidaMedicamento.getTipoSaida(),

                saidaMedicamento.getQuantidadeInformada(),
                saidaMedicamento.getUnidadeInformada(),

                saidaMedicamento.getQuantidadeBase(),
                saidaMedicamento.getUnidadeBase(),

                saidaMedicamento.getDataSaida(),

                saidaMedicamento.getObservacao(),

                saidaMedicamento.getDataCadastro(),
                saidaMedicamento.getAtualizadoEm()
        );
    }
}

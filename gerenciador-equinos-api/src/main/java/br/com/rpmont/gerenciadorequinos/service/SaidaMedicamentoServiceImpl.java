package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.SaidaMedicamentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.SaidaMedicamentoResponse;
import br.com.rpmont.gerenciadorequinos.enums.TipoSaidaMedicamentoEnum;
import br.com.rpmont.gerenciadorequinos.model.*;
import br.com.rpmont.gerenciadorequinos.repository.*;
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
    public SaidaMedicamentoResponse salvarSaidaMedicamento(SaidaMedicamentoRequest request) {

        validarAtendimentoObrigatorio(request);

        Medicamento medicamentoExistente = buscarMedicamento(request.medicamentoId());
        Equino equinoExistente = buscarEquino(request.equinoId());
        Atendimentos atendimentoExistente = buscarAtendimentoSeInformado(request.atendimentoId());

        SaidaMedicamento saidaMedicamento = new SaidaMedicamento();

        preencherDadosSaida(
                saidaMedicamento,
                request,
                medicamentoExistente,
                atendimentoExistente,
                equinoExistente
        );

        SaidaMedicamento saidaMedicamentoSalva = saidaMedicamentoRepository.save(saidaMedicamento);

        return toResponse(saidaMedicamentoSalva);
    }

    @Transactional(readOnly = true)
    @Override
    public SaidaMedicamentoResponse buscarSaidaMedicamentoId(Long id) {

        SaidaMedicamento saidaMedicamentoExistente = saidaMedicamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Saída de medicamento não encontrada no banco de dados."
                ));

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
    public SaidaMedicamentoResponse atualizarSaidamedicamentoId(Long id, SaidaMedicamentoRequest request) {

        validarAtendimentoObrigatorio(request);

        SaidaMedicamento saidaMedicamentoExistente = saidaMedicamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Saída de medicamento não encontrada no banco de dados."
                ));

        Medicamento medicamentoExistente = buscarMedicamento(request.medicamentoId());
        Equino equinoExistente = buscarEquino(request.equinoId());
        Atendimentos atendimentoExistente = buscarAtendimentoSeInformado(request.atendimentoId());

        preencherDadosSaida(
                saidaMedicamentoExistente,
                request,
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Saída de medicamento não encontrada no banco de dados."
                ));

        saidaMedicamentoRepository.delete(saidaMedicamentoExistente);
    }

    private void validarAtendimentoObrigatorio(SaidaMedicamentoRequest request) {
        if (request.tipoSaida() == TipoSaidaMedicamentoEnum.ATENDIMENTO
                && request.atendimentoId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O atendimento deve ser informado para saída do tipo ATENDIMENTO."
            );
        }
    }

    private Medicamento buscarMedicamento(Long medicamentoId) {
        return medicamentoRepository.findById(medicamentoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado no banco de dados."
                ));
    }

    private Equino buscarEquino(Long equinoId) {
        return equinoRepository.findById(equinoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."
                ));
    }

    private Atendimentos buscarAtendimentoSeInformado(Long atendimentoId) {
        if (atendimentoId == null) {
            return null;
        }

        return atendimentosRepository.findById(atendimentoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Atendimento não encontrado no banco de dados."
                ));
    }

    private void preencherDadosSaida(
            SaidaMedicamento saidaMedicamento,
            SaidaMedicamentoRequest request,
            Medicamento medicamento,
            Atendimentos atendimento,
            Equino equino
    ) {
        BigDecimal quantidadeBase = calcularQuantidadeBase(request.quantidadeInformada());

        saidaMedicamento.setMedicamento(medicamento);
        saidaMedicamento.setMedicamentoNome(medicamento.getNome());
        saidaMedicamento.setFabricante(medicamento.getFabricante());

        saidaMedicamento.setAtendimento(atendimento);
        saidaMedicamento.setVermifugacaoId(request.vermifugacaoId());
        saidaMedicamento.setVacinacaoId(request.vacinacaoId());

        saidaMedicamento.setEquino(equino);
        saidaMedicamento.setEquinoNome(equino.getNome());

        saidaMedicamento.setTipoSaida(request.tipoSaida());

        saidaMedicamento.setQuantidadeInformada(request.quantidadeInformada());
        saidaMedicamento.setUnidadeInformada(request.unidadeInformada());

        saidaMedicamento.setQuantidadeBase(quantidadeBase);
        saidaMedicamento.setUnidadeBase(medicamento.getUnidadeBase());

        saidaMedicamento.setDataSaida(request.dataSaida());
        saidaMedicamento.setObservacao(request.observacao());
    }

    private BigDecimal calcularQuantidadeBase(BigDecimal quantidadeInformada) {
        return quantidadeInformada;
    }

    private SaidaMedicamentoResponse toResponse(SaidaMedicamento saidaMedicamento) {
        Long atendimentoId = saidaMedicamento.getAtendimento() != null
                ? saidaMedicamento.getAtendimento().getId()
                : null;

        return new SaidaMedicamentoResponse(
                saidaMedicamento.getId(),

                saidaMedicamento.getMedicamento().getId(),
                saidaMedicamento.getMedicamentoNome(),
                saidaMedicamento.getFabricante(),

                atendimentoId,
                saidaMedicamento.getVermifugacaoId(),
                saidaMedicamento.getVacinacaoId(),

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
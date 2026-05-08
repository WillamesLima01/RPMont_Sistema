package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.AtendimentosRequest;
import br.com.rpmont.gerenciadorequinos.dtos.AtendimentosResponse;
import br.com.rpmont.gerenciadorequinos.model.Atendimentos;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.repository.AtendimentosRepository;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AtendimentosServiceImpl implements AtendimentosService {

    private final AtendimentosRepository atendimentosRepository;
    private final EquinoRepository equinoRepository;

    @Transactional
    @Override
    public AtendimentosResponse criarAtendimentos(AtendimentosRequest atendimentosRequest) {

        Equino equinoExistente = equinoRepository.findById(atendimentosRequest.equinoId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"
                ));

        Atendimentos cadastrarAtendimento = new Atendimentos();

        preencherDadosAtendimento(cadastrarAtendimento, atendimentosRequest, equinoExistente);

        Atendimentos atendimentoSalvo = atendimentosRepository.save(cadastrarAtendimento);

        return toResponse(atendimentoSalvo);
    }

    @Transactional(readOnly = true)
    @Override
    public List<AtendimentosResponse> buscarTodosAtendimentos() {
        return atendimentosRepository.findAll()
                .stream()
                .filter(atendimento -> Boolean.FALSE.equals(atendimento.getExcluido()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public AtendimentosResponse buscarAtendimentoId(Long id) {

        Atendimentos atendimentoExistente = atendimentosRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Atendimento não encontrado no banco de dados!"
                ));

        if (Boolean.TRUE.equals(atendimentoExistente.getExcluido())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Atendimento não encontrado no banco de dados!"
            );
        }

        return toResponse(atendimentoExistente);
    }

    @Transactional
    @Override
    public List<AtendimentosResponse> filtrarAtendimentos(
            Long equinoId,
            LocalDate dataInicio,
            LocalDate dataFim
    ) {
        return atendimentosRepository.filtrarAtendimentos(equinoId, dataInicio, dataFim)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @Override
    public AtendimentosResponse atualizarAtendimentoId(Long id, AtendimentosRequest atendimentosRequest) {

        Atendimentos atendimentoExistente = atendimentosRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Atendimento não encontrado no banco de dados!"
                ));

        if (Boolean.TRUE.equals(atendimentoExistente.getExcluido())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Atendimento não encontrado no banco de dados!"
            );
        }

        Equino equinoExistente = equinoRepository.findById(atendimentosRequest.equinoId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"
                ));

        preencherDadosAtendimento(atendimentoExistente, atendimentosRequest, equinoExistente);

        Atendimentos atendimentoAtualizado = atendimentosRepository.save(atendimentoExistente);

        return toResponse(atendimentoAtualizado);
    }

    @Transactional
    @Override
    public void deletarAtendimentoId(Long id) {

        Atendimentos atendimentoExistente = atendimentosRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Atendimento não encontrado no banco de dados!"
                ));

        if (Boolean.TRUE.equals(atendimentoExistente.getExcluido())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Atendimento não encontrado no banco de dados!"
            );
        }

        atendimentoExistente.setExcluido(true);
        atendimentoExistente.setDataExclusao(LocalDateTime.now());

        atendimentosRepository.save(atendimentoExistente);
    }

    private void preencherDadosAtendimento(Atendimentos atendimento,
                                           AtendimentosRequest atendimentosRequest,
                                           Equino equino) {

        atendimento.setTextoConsulta(atendimentosRequest.textoConsulta());
        atendimento.setEnfermidade(atendimentosRequest.enfermidade());
        atendimento.setEquino(equino);

        if (atendimento.getExcluido() == null) {
            atendimento.setExcluido(false);
        }
    }

    private AtendimentosResponse toResponse(Atendimentos atendimento) {

        Equino equino = atendimento.getEquino();

        return new AtendimentosResponse(
                atendimento.getId(),
                atendimento.getTextoConsulta(),
                atendimento.getEnfermidade(),
                atendimento.getDataAtendimento(),

                equino.getId(),
                equino.getNome(),
                equino.getRaca(),
                equino.getRegistro()
        );
    }
}
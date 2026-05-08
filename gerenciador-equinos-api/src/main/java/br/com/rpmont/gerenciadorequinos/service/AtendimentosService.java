package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.AtendimentosRequest;
import br.com.rpmont.gerenciadorequinos.dtos.AtendimentosResponse;

import java.time.LocalDate;
import java.util.List;


public interface AtendimentosService {

    AtendimentosResponse criarAtendimentos(AtendimentosRequest atendimentosRequest);
    List<AtendimentosResponse> buscarTodosAtendimentos();
    AtendimentosResponse buscarAtendimentoId(Long id);
    List<AtendimentosResponse> filtrarAtendimentos(Long equinoId, LocalDate dataInicio, LocalDate dataFim);
    AtendimentosResponse atualizarAtendimentoId(Long id, AtendimentosRequest atendimentosRequest);
    void deletarAtendimentoId(Long id);
}
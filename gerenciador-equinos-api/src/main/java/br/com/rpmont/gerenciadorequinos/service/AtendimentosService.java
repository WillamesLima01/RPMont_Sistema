package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.AtendimentosRequest;
import br.com.rpmont.gerenciadorequinos.dtos.AtendimentosResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AtendimentosService {

    AtendimentosResponse criarAtendimentos(AtendimentosRequest atendimentosRequest);
    List<AtendimentosResponse>buscarTodosAtendimentos();
    AtendimentosResponse buscarAtendimentoId(Long id);
    AtendimentosResponse atualizarAtendimentoId(Long id, AtendimentosRequest atendimentosRequest);
    void deletarAtendimentoId(Long id);
}

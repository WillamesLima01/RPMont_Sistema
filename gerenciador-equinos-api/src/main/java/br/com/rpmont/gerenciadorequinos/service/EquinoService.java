package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.EquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EquinoResponse;
import br.com.rpmont.gerenciadorequinos.dtos.EquinoSituacaoRequest;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public interface EquinoService {

    EquinoResponse criarEquino(EquinoRequest equinoRequest);

    Equino buscarEquinoId(Long id);

    List<Equino> buscarTodosEquinos();

    EquinoResponse atualizarEquino(Long id, EquinoRequest equinoRequest);

    Equino atualizarSituacao(Long id, EquinoSituacaoRequest request);

    void excluirEquinoId(Long id);

}

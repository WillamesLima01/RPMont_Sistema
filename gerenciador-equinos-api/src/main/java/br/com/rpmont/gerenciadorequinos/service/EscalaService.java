package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.EscalaRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EscalaResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface EscalaService {
    EscalaResponse criarEscala(EscalaRequest request);
    List<EscalaResponse> buscarTodasEscalas();
    EscalaResponse buscarEscalaId(Long id);
    EscalaResponse atualizarEscalaId(Long id, EscalaRequest request);
    void deletarEscalaId(Long id);
}

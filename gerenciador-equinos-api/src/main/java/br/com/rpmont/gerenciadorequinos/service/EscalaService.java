package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.EscalaRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EscalaResponse;
import br.com.rpmont.gerenciadorequinos.model.Escala;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface EscalaService {

    EscalaResponse criarEscala(EscalaRequest escalaRequest);

    List<Escala>buscarTodasEscalas();

    Escala buscarEscalaId(Long id);

    EscalaResponse atualizarEscalaId(Long id, EscalaRequest escalaRequest);
}

package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaRequest;
import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaResponse;
import br.com.rpmont.gerenciadorequinos.model.ResenhaDescritiva;
import org.springframework.stereotype.Service;

@Service
public interface ResenhaDescritivaService {

    ResenhaDescritivaResponse criarResenhaDecritiva(ResenhaDescritivaRequest resenhaDescritivaRequest);

    ResenhaDescritivaResponse atualizarResenhaDescritiva(Long id, ResenhaDescritivaRequest resenhaDescritivaRequest);

    ResenhaDescritiva buscarResenhaDescritivaId(Long equinoId);
}

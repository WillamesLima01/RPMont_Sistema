package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.ToaleteRequest;
import br.com.rpmont.gerenciadorequinos.dtos.ToaleteResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ToaleteService {

    ToaleteResponse criarToalete(ToaleteRequest toaleteRequest);
    ToaleteResponse buscarToaleteId(Long id);
    List<ToaleteResponse> listartodosToaletes();
    List<ToaleteResponse> listarToaletesPorEquinoId(Long equinoId);
    ToaleteResponse atualizarToaleteId(Long id, ToaleteRequest toaleteRequest);
    void deletarToaleteId(Long id);

}

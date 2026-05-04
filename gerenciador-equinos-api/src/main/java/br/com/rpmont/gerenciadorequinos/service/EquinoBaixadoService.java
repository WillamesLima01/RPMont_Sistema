package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.EquinoBaixadoResponse;

import java.util.List;

public interface EquinoBaixadoService {

    void baixarEquino(Long id);

    void retornarEquino(Long equinoId);

    List<EquinoBaixadoResponse> equinoBaixadoId(Long equinoId);

    List<EquinoBaixadoResponse> listarTodosBaixados();
}
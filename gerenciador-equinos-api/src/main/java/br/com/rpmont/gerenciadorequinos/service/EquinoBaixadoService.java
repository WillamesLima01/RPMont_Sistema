package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.model.EquinoBaixado;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface EquinoBaixadoService {

    void baixarEquino(Long id);
    void retornarEquino(Long equinoId);
    List<EquinoBaixado> equinoBaixadoId(Long equinoId);
    List<EquinoBaixado> listarTodosBaixados();
}

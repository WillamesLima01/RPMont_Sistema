package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoEquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoEquinoResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface FerrageamentoEquinoService {

    FerrageamentoEquinoResponse criarFerrageamento(FerrageamentoEquinoRequest ferrageamentoEquinoRequest);

    List<FerrageamentoEquinoResponse> listarTodosFerrageamentoEquino();

    FerrageamentoEquinoResponse buscarFerrageamentoId(Long id);

    FerrageamentoEquinoResponse atualizarFerrageamentoId(Long id, FerrageamentoEquinoRequest ferrageamentoEquinoRequest);

    void  deletarFerrageamentoId(long id);
}

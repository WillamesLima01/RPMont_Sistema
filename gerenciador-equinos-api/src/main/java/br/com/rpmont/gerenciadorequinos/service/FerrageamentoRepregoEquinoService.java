package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoRepregoEquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoRepregoEquinoResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface FerrageamentoRepregoEquinoService {

    FerrageamentoRepregoEquinoResponse criarFerrageamentoReprego(FerrageamentoRepregoEquinoRequest ferrageamentoRepregoEquinoRequest);

    List<FerrageamentoRepregoEquinoResponse> listarTodosFerrageamentoRepregoEquino();

    FerrageamentoRepregoEquinoResponse buscarFerrageamentoRepregoId(Long id);

    FerrageamentoRepregoEquinoResponse atualizarFerrageamentoRepregoId(Long id, FerrageamentoRepregoEquinoRequest ferrageamentoRepregoEquinoRequest);

    void deletarFerrageamentoRepregoId(Long id);
}

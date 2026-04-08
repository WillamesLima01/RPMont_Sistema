package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoEquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoEquinoResponse;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoRepregoEquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoRepregoEquinoResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.FerrageamentoRepregoEquinoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FerrageamentoRepregoEquinoServiceImpl implements FerrageamentoRepregoEquinoService{

    private final FerrageamentoRepregoEquinoRepository ferrageamentoRepregoEquinoRepository;
    private final EquinoRepository equinoRepository;


    @Override
    public FerrageamentoEquinoResponse criarFerrageamentoReprego(FerrageamentoRepregoEquinoRequest ferrageamentoRepregoEquinoRequest) {
        return null;
    }

    @Override
    public List<FerrageamentoRepregoEquinoResponse> listarTodosFerrageamentoRepregoEquino() {
        return List.of();
    }

    @Override
    public FerrageamentoRepregoEquinoResponse buscarFerrageamentoRepregoId(Long id) {
        return null;
    }

    @Override
    public FerrageamentoRepregoEquinoResponse atualizarFerrageamentoRepregoId(Long id, FerrageamentoRepregoEquinoRequest ferrageamentoRepregoEquinoRequest) {
        return null;
    }

    @Override
    public void deletarFerrageamentoRepregoId(Long id) {

    }
}

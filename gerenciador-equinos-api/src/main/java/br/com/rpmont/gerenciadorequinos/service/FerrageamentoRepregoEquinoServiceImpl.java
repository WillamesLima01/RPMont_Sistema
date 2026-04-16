package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoRepregoEquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoRepregoEquinoResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.FerrageamentoRepregoEquino;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.FerrageamentoRepregoEquinoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FerrageamentoRepregoEquinoServiceImpl implements FerrageamentoRepregoEquinoService{

    private final FerrageamentoRepregoEquinoRepository ferrageamentoRepregoEquinoRepository;
    private final EquinoRepository equinoRepository;

    @Transactional
    @Override
    public FerrageamentoRepregoEquinoResponse criarFerrageamentoReprego(FerrageamentoRepregoEquinoRequest ferrageamentoRepregoEquinoRequest) {

        Equino equinoExistente = equinoRepository.findById(ferrageamentoRepregoEquinoRequest.equinoId())
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."));

        FerrageamentoRepregoEquino salvarFerrageamentoReprego = new FerrageamentoRepregoEquino();

        salvarFerrageamentoReprego.setEquino(equinoExistente);
        salvarFerrageamentoReprego.setPatas(ferrageamentoRepregoEquinoRequest.patas());
        salvarFerrageamentoReprego.setFerroNovo(ferrageamentoRepregoEquinoRequest.ferroNovo());
        salvarFerrageamentoReprego.setCravosUsados(ferrageamentoRepregoEquinoRequest.cravosUsados());
        salvarFerrageamentoReprego.setObservacoes(ferrageamentoRepregoEquinoRequest.observacoes());

        return toResponse(ferrageamentoRepregoEquinoRepository.save(salvarFerrageamentoReprego));
    }

    @Transactional(readOnly = true)
    @Override
    public List<FerrageamentoRepregoEquinoResponse> listarTodosFerrageamentoRepregoEquino() {
        return ferrageamentoRepregoEquinoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public FerrageamentoRepregoEquinoResponse buscarFerrageamentoRepregoId(Long id) {
        FerrageamentoRepregoEquino ferrageamentoRepregoEquinoExistente = ferrageamentoRepregoEquinoRepository.findById(id)
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Ferrageamento Reprego não encontrado no banco de dados."));

        return toResponse(ferrageamentoRepregoEquinoExistente);
    }

    @Transactional
    @Override
    public FerrageamentoRepregoEquinoResponse atualizarFerrageamentoRepregoId(Long id, FerrageamentoRepregoEquinoRequest ferrageamentoRepregoEquinoRequest) {

        Equino equinoExistente = equinoRepository.findById(ferrageamentoRepregoEquinoRequest.equinoId())
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."));

        FerrageamentoRepregoEquino ferrageamentoRepregoEquinoExistente = ferrageamentoRepregoEquinoRepository.findById(id)
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Ferrageamento reprego não encontrado no banco de dados."));

        ferrageamentoRepregoEquinoExistente.setEquino(equinoExistente);
        ferrageamentoRepregoEquinoExistente.setPatas(ferrageamentoRepregoEquinoRequest.patas());
        ferrageamentoRepregoEquinoExistente.setFerroNovo(ferrageamentoRepregoEquinoRequest.ferroNovo());
        ferrageamentoRepregoEquinoExistente.setCravosUsados(ferrageamentoRepregoEquinoRequest.cravosUsados());
        ferrageamentoRepregoEquinoExistente.setObservacoes(ferrageamentoRepregoEquinoRequest.observacoes());

        return toResponse(ferrageamentoRepregoEquinoRepository.save(ferrageamentoRepregoEquinoExistente));
    }

    @Transactional
    @Override
    public void deletarFerrageamentoRepregoId(Long id) {
            FerrageamentoRepregoEquino ferrageamentoRepregoEquinoExistente = ferrageamentoRepregoEquinoRepository.findById(id)
                    .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Ferrageamento reprego não encontrado no banco de dados."));

            ferrageamentoRepregoEquinoRepository.delete(ferrageamentoRepregoEquinoExistente);
    }

    private FerrageamentoRepregoEquinoResponse toResponse(FerrageamentoRepregoEquino ferrageamentoRepregoEquino) {
        return new FerrageamentoRepregoEquinoResponse(
                ferrageamentoRepregoEquino.getId(),
                ferrageamentoRepregoEquino.getEquino().getId(),
                ferrageamentoRepregoEquino.getEquino().getNome(),
                new ArrayList<>(ferrageamentoRepregoEquino.getPatas()),
                ferrageamentoRepregoEquino.getFerroNovo(),
                ferrageamentoRepregoEquino.getCravosUsados(),
                ferrageamentoRepregoEquino.getObservacoes(),
                ferrageamentoRepregoEquino.getDataCadastro(),
                ferrageamentoRepregoEquino.getAtualizadoEm()
        );
    }
}

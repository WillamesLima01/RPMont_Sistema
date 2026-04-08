package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoEquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoEquinoResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.FerrageamentoEquino;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.FerrageamentoEquinoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FerrageamentoEquinoServiceImpl implements FerrageamentoEquinoService{

    private final FerrageamentoEquinoRepository ferrageamentoEquinoRepository;
    private final EquinoRepository equinoRepository;

    @Override
    @Transactional
    public FerrageamentoEquinoResponse criarFerrageamento(FerrageamentoEquinoRequest ferrageamentoEquinoRequest) {

        Equino equinoExistente = equinoRepository.findById(ferrageamentoEquinoRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"));

        FerrageamentoEquino salvarFerrageamento = new FerrageamentoEquino();

        salvarFerrageamento.setEquino(equinoExistente);
        salvarFerrageamento.setTipoFerradura(ferrageamentoEquinoRequest.tipoFerradura());
        salvarFerrageamento.setTipoCravo(ferrageamentoEquinoRequest.tipoCravo());
        salvarFerrageamento.setTipoJustura(ferrageamentoEquinoRequest.tipoJustura());
        salvarFerrageamento.setTipoFerrageamento(ferrageamentoEquinoRequest.tipoFerrageamento());
        salvarFerrageamento.setFerros(ferrageamentoEquinoRequest.ferros());
        salvarFerrageamento.setCravos(ferrageamentoEquinoRequest.cravos());
        salvarFerrageamento.setObservacoes(ferrageamentoEquinoRequest.observacoes());
        salvarFerrageamento.setDataProximoProcedimento(ferrageamentoEquinoRequest.dataProximoProcedimento());

        return toResponse(ferrageamentoEquinoRepository.save(salvarFerrageamento));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FerrageamentoEquinoResponse> listarTodosFerrageamentoEquino() {
        return ferrageamentoEquinoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FerrageamentoEquinoResponse buscarFerrageamentoId(Long id) {
        FerrageamentoEquino ferrageamentoExistente = ferrageamentoEquinoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Ferrageamento não encontrado no banco de dados!"));

        return toResponse(ferrageamentoExistente);
    }

    @Override
    @Transactional
    public FerrageamentoEquinoResponse atualizarFerrageamentoId(Long id, FerrageamentoEquinoRequest ferrageamentoEquinoRequest) {
        FerrageamentoEquino ferrageamentoExistente = ferrageamentoEquinoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Ferrageamento não encontrado no banco de dados!"));

        Equino equinoExistente = equinoRepository.findById(ferrageamentoEquinoRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"));

        ferrageamentoExistente.setEquino(equinoExistente);
        ferrageamentoExistente.setTipoFerradura(ferrageamentoEquinoRequest.tipoFerradura());
        ferrageamentoExistente.setTipoCravo(ferrageamentoEquinoRequest.tipoCravo());
        ferrageamentoExistente.setTipoJustura(ferrageamentoEquinoRequest.tipoJustura());
        ferrageamentoExistente.setTipoFerrageamento(ferrageamentoEquinoRequest.tipoFerrageamento());
        ferrageamentoExistente.setFerros(ferrageamentoEquinoRequest.ferros());
        ferrageamentoExistente.setCravos(ferrageamentoEquinoRequest.cravos());
        ferrageamentoExistente.setObservacoes(ferrageamentoEquinoRequest.observacoes());
        ferrageamentoExistente.setDataProximoProcedimento(ferrageamentoEquinoRequest.dataProximoProcedimento());

        return toResponse(ferrageamentoEquinoRepository.save(ferrageamentoExistente));
    }

    @Override
    @Transactional
    public void deletarFerrageamentoId(long id) {
        FerrageamentoEquino ferrageamentoExistente = ferrageamentoEquinoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"));

        ferrageamentoEquinoRepository.delete(ferrageamentoExistente);
    }

    private FerrageamentoEquinoResponse toResponse(FerrageamentoEquino salvarFerrageamento) {

        return new FerrageamentoEquinoResponse(
                salvarFerrageamento.getId(),
                salvarFerrageamento.getEquino().getId(),
                salvarFerrageamento.getEquino().getNome(),
                salvarFerrageamento.getTipoFerradura(),
                salvarFerrageamento.getTipoCravo(),
                salvarFerrageamento.getTipoJustura(),
                salvarFerrageamento.getTipoFerrageamento(),
                salvarFerrageamento.getFerros(),
                salvarFerrageamento.getCravos(),
                salvarFerrageamento.getObservacoes(),
                salvarFerrageamento.getDataProximoProcedimento(),
                salvarFerrageamento.getDataCadastro(),
                salvarFerrageamento.getAtualizadoEm()
        );
    }
}

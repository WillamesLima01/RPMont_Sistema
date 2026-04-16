package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoCurativoEquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoCurativoEquinoResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.FerrageamentoCurativoEquino;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.FerrageamentoCurativoEquinoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FerrageamentoCurativoEquinoServiceImpl implements FerrageamentoCurativoEquinoService {

    private final FerrageamentoCurativoEquinoRepository ferrageamentoCurativoEquinoRepository;
    private final EquinoRepository equinoRepository;


    @Override
    @Transactional
    public FerrageamentoCurativoEquinoResponse criarFerrageamentoCurativo(FerrageamentoCurativoEquinoRequest ferrageamentoCurativoEquinoRequest) {

        Equino equinoExistente = equinoRepository.findById(ferrageamentoCurativoEquinoRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."));

        FerrageamentoCurativoEquino salvarFerrageamentoCurativo = new FerrageamentoCurativoEquino();

        salvarFerrageamentoCurativo.setEquino(equinoExistente);
        salvarFerrageamentoCurativo.setTipoCurativo(ferrageamentoCurativoEquinoRequest.tipoCurativo());
        salvarFerrageamentoCurativo.setObservacoes(ferrageamentoCurativoEquinoRequest.observacoes());

        return toResponse(ferrageamentoCurativoEquinoRepository.save(salvarFerrageamentoCurativo));
    }


    @Override
    @Transactional(readOnly = true)
    public List<FerrageamentoCurativoEquinoResponse> listarTodosFerrageamentoCurativoEquino() {
        return ferrageamentoCurativoEquinoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FerrageamentoCurativoEquinoResponse buscarFerrageamentoCurativoId(Long id) {
        FerrageamentoCurativoEquino ferrageamentoCurativoExistente = ferrageamentoCurativoEquinoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Ferrageamento curativo não encontrado no banco de dados."));

        return toResponse(ferrageamentoCurativoExistente);
    }

    @Override
    @Transactional
    public FerrageamentoCurativoEquinoResponse atualizarFerrageamentoCurativoId(
            Long id, FerrageamentoCurativoEquinoRequest ferrageamentoCurativoEquinoRequest) {

        Equino equinoExistente = equinoRepository.findById(ferrageamentoCurativoEquinoRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."));

        FerrageamentoCurativoEquino ferrageamentoCurativoExistente = ferrageamentoCurativoEquinoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Ferrageamento curativo não encontrado no banco de dados."));

        ferrageamentoCurativoExistente.setEquino(equinoExistente);
        ferrageamentoCurativoExistente.setTipoCurativo(ferrageamentoCurativoEquinoRequest.tipoCurativo());
        ferrageamentoCurativoExistente.setObservacoes(ferrageamentoCurativoEquinoRequest.observacoes());

        return toResponse(ferrageamentoCurativoEquinoRepository.save(ferrageamentoCurativoExistente));
    }

    @Override
    @Transactional
    public void deletarFerrageamentoCurativoId(long id) {
        FerrageamentoCurativoEquino ferrageamentoCurativoExistente = ferrageamentoCurativoEquinoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Ferrageamento curativo não encontrado no banco de dados."));

        ferrageamentoCurativoEquinoRepository.delete(ferrageamentoCurativoExistente);
    }

    private FerrageamentoCurativoEquinoResponse toResponse(FerrageamentoCurativoEquino ferrageamentoCurativoEquino){

        return new FerrageamentoCurativoEquinoResponse(
                ferrageamentoCurativoEquino.getId(),
                ferrageamentoCurativoEquino.getEquino().getId(),
                ferrageamentoCurativoEquino.getEquino().getNome(),
                ferrageamentoCurativoEquino.getTipoCurativo(),
                ferrageamentoCurativoEquino.getObservacoes(),
                ferrageamentoCurativoEquino.getDataCadastro(),
                ferrageamentoCurativoEquino.getAtualizadoEm()
        );
    }
}

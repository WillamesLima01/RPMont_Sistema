package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.EquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EquinoResponse;
import br.com.rpmont.gerenciadorequinos.dtos.EquinoSituacaoRequest;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;


@Service
@RequiredArgsConstructor
public class EquinoServiceImpl implements EquinoService{

    private final EquinoRepository equinoRepository;

    @Transactional
    @Override
    public EquinoResponse criarEquino(EquinoRequest equinoRequest) {

        if (equinoRepository.existsByNomeAndDataNascimentoAndExcluidoFalse(
                equinoRequest.nome(),
                equinoRequest.dataNascimento())) {

            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Equino já cadastrado no banco de dados!");

        }

        Equino cadastrarEquino = new Equino();

        cadastrarEquino.setNome(equinoRequest.nome());
        cadastrarEquino.setAltura(equinoRequest.altura());
        cadastrarEquino.setRaca(equinoRequest.raca());
        cadastrarEquino.setDataNascimento(equinoRequest.dataNascimento());
        cadastrarEquino.setRegistro(equinoRequest.registro());
        cadastrarEquino.setRegistro(equinoRequest.registro());
        cadastrarEquino.setPelagem(equinoRequest.pelagem());
        cadastrarEquino.setPeso(equinoRequest.peso());
        cadastrarEquino.setLocal(equinoRequest.local());
        cadastrarEquino.setSexo(equinoRequest.sexo());
        cadastrarEquino.setSituacao(equinoRequest.situacao());

        Equino equinoCadastrado = equinoRepository.save(cadastrarEquino);

        return toResponse(equinoCadastrado);
    }

    @Transactional(readOnly = true)
    @Override
    public Equino buscarEquinoId(Long id) {

        return equinoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado!"));
    }

    @Transactional(readOnly = true)
    @Override
    public List<Equino> buscarTodosEquinos() {
        return equinoRepository.findByExcluidoFalseOrderByNomeAsc();
    }

    @Override
    @Transactional
    public Equino atualizarSituacao(Long id, EquinoSituacaoRequest request) {

        Equino equinoExistente = equinoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."
                ));

        if (Boolean.TRUE.equals(equinoExistente.getExcluido())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Não é possível alterar a situação de um equino excluído."
            );
        }

        equinoExistente.setSituacao(request.situacao().trim().toUpperCase());

        return equinoRepository.save(equinoExistente);
    }

    @Transactional
    @Override
    public EquinoResponse atualizarEquino(Long id, EquinoRequest equinoRequest) {

        Equino equinoExistente = equinoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado!"));

        equinoExistente.setNome(equinoRequest.nome());
        equinoExistente.setAltura(equinoRequest.altura());
        equinoExistente.setRaca(equinoRequest.raca());
        equinoExistente.setDataNascimento(equinoRequest.dataNascimento());
        equinoExistente.setRegistro(equinoRequest.registro());
        equinoExistente.setRegistro(equinoRequest.registro());
        equinoExistente.setPelagem(equinoRequest.pelagem());
        equinoExistente.setPeso(equinoRequest.peso());
        equinoExistente.setLocal(equinoRequest.local());
        equinoExistente.setSexo(equinoRequest.sexo());
        equinoExistente.setSituacao(equinoRequest.situacao());

        Equino equinoAtualizado = equinoRepository.save(equinoExistente);

        return toResponse(equinoAtualizado);
    }

    @Transactional
    @Override
    public void excluirEquinoId(Long id) {
        Equino equinoExistente = equinoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."
                ));

        equinoExistente.setExcluido(true);
        equinoExistente.setDataExclusao(LocalDateTime.now());

        equinoRepository.save(equinoExistente);
    }

    private EquinoResponse toResponse(Equino equino) {
        return new EquinoResponse(
                equino.getId(),
                equino.getNome(),
                equino.getAltura(),
                equino.getRaca(),
                equino.getSituacao(),
                equino.getDataCadastro(),
                equino.getAtualizadoEm()
        );
    }
}

package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.EquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EquinoResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


@Service
@RequiredArgsConstructor
public class EquinoServiceImpl implements EquinoService{

    private final EquinoRepository equinoRepository;

    @Override
    public EquinoResponse criarEquino(EquinoRequest equinoRequest) {

        if(equinoRepository.existsByNomeAndDataNascimento(
                equinoRequest.nome(),
                equinoRequest.dataNascimento())){

            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Equino já cadastrado no banco de dados!");

        }

        Equino cadastrarEquino = new Equino();

        cadastrarEquino.setNome(equinoRequest.nome());
        cadastrarEquino.setAltura(equinoRequest.altura());
        cadastrarEquino.setRaca(equinoRequest.raca());
        cadastrarEquino.setDataNascimento(equinoRequest.dataNascimento());
        cadastrarEquino.setInclusao(equinoRequest.inclusao());
        cadastrarEquino.setPelagem(equinoRequest.pelagem());
        cadastrarEquino.setPeso(equinoRequest.peso());
        cadastrarEquino.setLocal(equinoRequest.local());
        cadastrarEquino.setSexo(equinoRequest.sexo());
        cadastrarEquino.setSituacao(equinoRequest.situacao());

        Equino equinoCadastrado = equinoRepository.save(cadastrarEquino);

        return toResponse(equinoCadastrado);
    }

    @Override
    public Equino buscarEquinoId(Long id) {

        return equinoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado!"));
    }

    @Override
    public List<Equino> buscarTodosEquinos() {

        return equinoRepository.findAll();
    }

    @Override
    public EquinoResponse atualizarEquino(Long id, EquinoRequest equinoRequest) {

        Equino equinoExistente = equinoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado!"));

        equinoExistente.setNome(equinoRequest.nome());
        equinoExistente.setAltura(equinoRequest.altura());
        equinoExistente.setRaca(equinoRequest.raca());
        equinoExistente.setDataNascimento(equinoRequest.dataNascimento());
        equinoExistente.setInclusao(equinoRequest.inclusao());
        equinoExistente.setPelagem(equinoRequest.pelagem());
        equinoExistente.setPeso(equinoRequest.peso());
        equinoExistente.setLocal(equinoRequest.local());
        equinoExistente.setSexo(equinoRequest.sexo());
        equinoExistente.setSituacao(equinoRequest.situacao());

        Equino equinoAtualizado = equinoRepository.save(equinoExistente);

        return toResponse(equinoAtualizado);
    }

    @Override
    public void deletarEquinoId(Long id) {
        Equino deletarExistente = equinoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado!"));

        equinoRepository.delete(deletarExistente);
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

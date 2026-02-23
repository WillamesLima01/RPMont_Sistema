package br.com.rpmont.gerenciadorequinos.service;


import br.com.rpmont.gerenciadorequinos.dtos.EquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EquinoResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class EquinoServiceImpl implements EquinoService{

    @Autowired
    EquinoRepository equinoRepository;

    @Override
    public EquinoResponse criarEquino(EquinoRequest equinoRequest) {

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

        return new EquinoResponse(
                "Equino cadastrado com sucesso!",
                equinoCadastrado.getId()
        );
    }

    @Override
    public List<Equino> buscarEquinoId(Long id) {
        return List.of();
    }

    @Override
    public List<Equino> buscarTodosEquinos() {
        return List.of();
    }

    @Override
    public EquinoResponse atualizarEquino(Long id, EquinoRequest equinoRequest) {
        return null;
    }

    @Override
    public void deletarEquinoId(Long id) {

    }
}

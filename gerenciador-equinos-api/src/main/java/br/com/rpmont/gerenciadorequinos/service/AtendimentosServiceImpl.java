package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.AtendimentosRequest;
import br.com.rpmont.gerenciadorequinos.dtos.AtendimentosResponse;
import br.com.rpmont.gerenciadorequinos.model.Atendimentos;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.repository.AtendimentosRepository;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AtendimentosServiceImpl implements AtendimentosService{

    private final AtendimentosRepository atendimentosRepository;
    private final EquinoRepository equinoRepository;

    @Transactional
    @Override
    public AtendimentosResponse criarAtendimentos(AtendimentosRequest atendimentosRequest) {

        Equino equinoExistente = equinoRepository.findById(atendimentosRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"));

        Atendimentos cadastrarAtendimento = new Atendimentos();
        cadastrarAtendimento.setTextoConsulta(atendimentosRequest.textoConsulta());
        cadastrarAtendimento.setEnfermidade(atendimentosRequest.enfermidade());
        cadastrarAtendimento.setEquino(equinoExistente);

        Atendimentos atendimentoSalvar = atendimentosRepository.save(cadastrarAtendimento);

        return  null;

    }

    @Override
    public List<AtendimentosResponse> buscarTodosAtendimentos() {
        return List.of();
    }

    @Override
    public AtendimentosResponse buscarAtendimentoId(Long id) {
        return null;
    }

    @Override
    public AtendimentosResponse atualizarAtendimentoId(Long id, AtendimentosRequest atendimentosRequest) {
        return null;
    }

    @Override
    public void deletarAtendimentoId(Long id) {

    }

    private AtendimentosResponse toResponse(Atendimentos atendimentos){

        Equino equino = atendimentos.getEquino();



        return new AtendimentosResponse(
                atendimentos.getId(),
                atendimentos.getTextoConsulta(),
                atendimentos.getEnfermidade(),
                atendimentos.getDataAtendimento()
        );
    }
}

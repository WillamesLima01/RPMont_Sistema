package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.EquinoResumoResponse;
import br.com.rpmont.gerenciadorequinos.dtos.EscalaRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EscalaResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.Escala;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.EscalaRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EscalaServiceImpl implements EscalaService {

    private final EscalaRepository escalaRepository;
    private final EquinoRepository equinoRepository;

    @Transactional
    @Override
    public EscalaResponse criarEscala(EscalaRequest escalaRequest) {

        Equino equinoExistente = equinoRepository.findById(escalaRequest.equinoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"));

        Escala cadastrarEscala = new Escala();
        cadastrarEscala.setLocalTrabalho(escalaRequest.localTrabalho());
        cadastrarEscala.setJornadaTrabalho(escalaRequest.jornadaTrabalho());
        cadastrarEscala.setCavaleiro(escalaRequest.cavaleiro());
        cadastrarEscala.setCargaHoraria(escalaRequest.cargaHoraria());
        cadastrarEscala.setObservacao(escalaRequest.observacao());
        cadastrarEscala.setEquino(equinoExistente);

        Escala escalaSalva = escalaRepository.save(cadastrarEscala);

        return toResponse(escalaSalva);
    }

    @Override
    public List<EscalaResponse> buscarTodasEscalas() {
        return escalaRepository.findAllWithEquino()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public EscalaResponse buscarEscalaId(Long id) {
        Escala escala = escalaRepository.findByIdWithEquino(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Escala não encontrada no banco de dados!"));

        return toResponse(escala);
    }

    @Transactional
    @Override
    public EscalaResponse atualizarEscalaId(Long id, EscalaRequest escalaRequest) {

        // IMPORTANTE: buscar COM equino junto
        Escala escalaExistente = escalaRepository.findByIdWithEquino(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Escala não encontrada no banco de dados!"));

        escalaExistente.setLocalTrabalho(escalaRequest.localTrabalho());
        escalaExistente.setJornadaTrabalho(escalaRequest.jornadaTrabalho());
        escalaExistente.setCavaleiro(escalaRequest.cavaleiro());
        escalaExistente.setCargaHoraria(escalaRequest.cargaHoraria());
        escalaExistente.setObservacao(escalaRequest.observacao()); // se já existe no request

        // nem precisa guardar retorno. o "escalaExistente" já é managed dentro da transação
        escalaRepository.save(escalaExistente);

        return toResponse(escalaExistente);
    }

    @Override
    public void deletarEscalaId(Long id) {
        if (!escalaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Escala não encontrada no banco de dados!");
        }
        escalaRepository.deleteById(id);
    }

    private EscalaResponse toResponse(Escala escala) {

        Equino eq = escala.getEquino();

        EquinoResumoResponse equinoResumo = new EquinoResumoResponse(
                eq.getId(),
                eq.getNome(),
                eq.getRegistro(),
                eq.getSituacao()
        );

        return new EscalaResponse(
                escala.getId(),
                equinoResumo,
                escala.getLocalTrabalho(),
                escala.getJornadaTrabalho(),
                escala.getCavaleiro(),
                escala.getObservacao(),
                escala.getCargaHoraria(),
                escala.getDataCadastro(),
                escala.getAtualizadoEm()
        );
    }
}
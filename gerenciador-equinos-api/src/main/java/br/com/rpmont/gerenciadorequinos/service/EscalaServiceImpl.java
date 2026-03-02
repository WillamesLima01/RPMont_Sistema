package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.EscalaRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EscalaResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.Escala;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.EscalaRepository;
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

    @Override
    public EscalaResponse criarEscala(EscalaRequest escalaRequest) {

        Equino equinoExistente = equinoRepository.findById(escalaRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"));

        Escala cadastrarEscala = new Escala();

        cadastrarEscala.setLocalTrabalho(escalaRequest.localTrabalho());
        cadastrarEscala.setJornadaTrabalho(escalaRequest.jornadaTrabalho());
        cadastrarEscala.setCavaleiro(escalaRequest.cavaleiro());
        cadastrarEscala.setCargaHoraria(escalaRequest.cargaHoraria());
        cadastrarEscala.setEquino(equinoExistente);

        Escala escalaSalva = escalaRepository.save(cadastrarEscala);

        return new EscalaResponse(
                escalaSalva.getId(),
                equinoExistente.getId(),
                equinoExistente.getNome(),
                escalaSalva.getLocalTrabalho(),
                escalaSalva.getJornadaTrabalho(),
                escalaSalva.getCavaleiro(),
                escalaSalva.getCargaHoraria()
        );
    }

    @Override
    public List<Escala> buscarTodasEscalas() {
        return escalaRepository.findAll();
    }

    @Override
    public Escala buscarEscalaId(Long id) {

        return escalaRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Escala não encontrada no banco de dados!"));

    }

    @Override
    public EscalaResponse atualizarEscalaId(Long id, EscalaRequest escalaRequest) {

        Escala escalaExistente = escalaRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Escala não encontrada no banco de dados!"));

        escalaExistente.setLocalTrabalho(escalaRequest.localTrabalho());
        escalaExistente.setJornadaTrabalho(escalaRequest.jornadaTrabalho());
        escalaExistente.setCavaleiro(escalaRequest.cavaleiro());
        escalaExistente.setCargaHoraria(escalaRequest.cargaHoraria());

        Escala escalaAtualizada = escalaRepository.save(escalaExistente);

        Equino equino = escalaAtualizada.getEquino();

        return new EscalaResponse(

                escalaAtualizada.getId(),
                equino.getId(),
                equino.getNome(),
                escalaAtualizada.getLocalTrabalho(),
                escalaAtualizada.getJornadaTrabalho(),
                escalaAtualizada.getCavaleiro(),
                escalaAtualizada.getCargaHoraria()
        );
    }

    @Override
    public void deletarEscalaId(Long id) {

        escalaRepository.deleteById(id);
    }
}

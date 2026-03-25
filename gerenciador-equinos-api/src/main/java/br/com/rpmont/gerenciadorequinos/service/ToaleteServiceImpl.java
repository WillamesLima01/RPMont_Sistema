package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.ToaleteRequest;
import br.com.rpmont.gerenciadorequinos.dtos.ToaleteResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.Toalete;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.ToaleteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ToaleteServiceImpl implements ToaleteService{

    private final ToaleteRepository toaleteRepository;
    private final EquinoRepository equinoRepository;

    @Override
    @Transactional
    public ToaleteResponse criarToalete(ToaleteRequest toaleteRequest) {

        Equino equinoExistente = equinoRepository.findById(toaleteRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Equino não encontrado no banco de dados!"));

        Toalete toalete = new Toalete();
        toalete.setEquino(equinoExistente);
        toalete.setTosa(toaleteRequest.tosa());
        toalete.setBanho(toaleteRequest.banho());
        toalete.setLimpezaOuvidos(toaleteRequest.limpezaOuvidos());
        toalete.setLimpezaGenital(toaleteRequest.limpezaGenital());
        toalete.setLimpezaCascos(toaleteRequest.limpezaCascos());
        toalete.setRipagemCrina(toaleteRequest.ripagemCrina());
        toalete.setRipagemCola(toaleteRequest.ripagemCola());
        toalete.setEscovacao(toaleteRequest.escovacao());
        toalete.setRasqueamento(toaleteRequest.rasqueamento());
        toalete.setObservacao(toaleteRequest.observacao());

        Toalete toaleteSalvar = toaleteRepository.save(toalete);

        return converterToaleteParaResponse(toaleteSalvar);
    }

    @Transactional(readOnly = true)
    @Override
    public ToaleteResponse buscarToaleteId(Long id) {
        Toalete toaleteExistente = toaleteRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Toalete não encontrado no banco de dados!"));

        return converterToaleteParaResponse(toaleteExistente);
    }

    @Transactional(readOnly = true)
    @Override
    public List<ToaleteResponse> listartodosToaletes() {
        return toaleteRepository.findAll()
                .stream()
                .map(this::converterToaleteParaResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<ToaleteResponse> listarToaletesPorEquinoId(Long equinoId) {

        equinoRepository.findById(equinoId)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"));

        return toaleteRepository.findById(equinoId)
                .stream()
                .map(this:: converterToaleteParaResponse)
                .toList();
    }

    @Override
    @Transactional
    public ToaleteResponse atualizarToaleteId(Long id, ToaleteRequest toaleteRequest) {

        Toalete toaleteExistente = toaleteRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Toalete não encontrado no banco de dados!"));

        Equino equinoExistente = equinoRepository.findById(toaleteRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"));


        toaleteExistente.setEquino(equinoExistente);
        toaleteExistente.setTosa(toaleteRequest.tosa());
        toaleteExistente.setBanho(toaleteRequest.banho());
        toaleteExistente.setLimpezaOuvidos(toaleteRequest.limpezaOuvidos());
        toaleteExistente.setLimpezaGenital(toaleteRequest.limpezaGenital());
        toaleteExistente.setLimpezaCascos(toaleteRequest.limpezaCascos());
        toaleteExistente.setRipagemCrina(toaleteRequest.ripagemCrina());
        toaleteExistente.setRipagemCola(toaleteRequest.ripagemCola());
        toaleteExistente.setEscovacao(toaleteRequest.escovacao());
        toaleteExistente.setRasqueamento(toaleteRequest.rasqueamento());
        toaleteExistente.setObservacao(toaleteRequest.observacao());

        Toalete toaleteAtualizado = toaleteRepository.save(toaleteExistente);

        return converterToaleteParaResponse(toaleteAtualizado);
    }

    @Override
    @Transactional
    public void deletarToaleteId(Long id) {
            Toalete toaleteExistente = toaleteRepository.findById(id)
                    .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Toalete não encontrado no banco de dados!"));

            toaleteRepository.delete(toaleteExistente);
    }

    private ToaleteResponse converterToaleteParaResponse(Toalete toalete) {
        return new ToaleteResponse(
                toalete.getId(),
                toalete.getEquino().getId(),
                toalete.getEquino().getNome(),
                toalete.getTosa(),
                toalete.getBanho(),
                toalete.getLimpezaOuvidos(),
                toalete.getLimpezaGenital(),
                toalete.getLimpezaCascos(),
                toalete.getRipagemCrina(),
                toalete.getRipagemCola(),
                toalete.getEscovacao(),
                toalete.getRasqueamento(),
                toalete.getObservacao(),
                toalete.getDataCadastro(),
                toalete.getDataAtualizacao()
        );
    }
}

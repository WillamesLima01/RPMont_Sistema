package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.EquinoBaixadoResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.EquinoBaixado;
import br.com.rpmont.gerenciadorequinos.repository.EquinoBaixadoRepository;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquinoBaixadoServiceImpl implements EquinoBaixadoService {

    private final EquinoBaixadoRepository baixadoRepository;
    private final EquinoRepository equinoRepository;

    @Override
    @Transactional
    public void baixarEquino(Long id) {

        Equino equinoExistente = equinoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"
                ));

        if ("BAIXADO".equalsIgnoreCase(equinoExistente.getSituacao())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Equino já está com status Baixado"
            );
        }

        equinoExistente.setSituacao("BAIXADO");
        equinoRepository.save(equinoExistente);

        EquinoBaixado novoRegistro = new EquinoBaixado();
        novoRegistro.setEquino(equinoExistente);
        novoRegistro.setDataBaixa(LocalDate.now());
        novoRegistro.setDataRetorno(null);

        baixadoRepository.save(novoRegistro);
    }

    @Override
    @Transactional
    public void retornarEquino(Long equinoId) {

        Equino equinoExistente = equinoRepository.findById(equinoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"
                ));

        EquinoBaixado baixaAberta = baixadoRepository
                .findFirstByEquinoIdAndDataRetornoIsNullOrderByDataBaixaDesc(equinoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Não existe baixa aberta para este equino."
                ));

        baixaAberta.setDataRetorno(LocalDate.now());
        baixadoRepository.save(baixaAberta);

        equinoExistente.setSituacao("APTO");
        equinoRepository.save(equinoExistente);
    }

    @Override
    public List<EquinoBaixadoResponse> equinoBaixadoId(Long equinoId) {

        if (!equinoRepository.existsById(equinoId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Equino não encontrado no banco de dados!"
            );
        }

        return baixadoRepository.findByEquinoIdOrderByDataBaixaDesc(equinoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<EquinoBaixadoResponse> listarTodosBaixados() {
        return baixadoRepository.buscarBaixadosPorSituacaoEquino("BAIXADO")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private EquinoBaixadoResponse toResponse(EquinoBaixado equinoBaixado) {
        return new EquinoBaixadoResponse(
                equinoBaixado.getId(),
                equinoBaixado.getEquino().getId(),
                equinoBaixado.getEquino().getNome(),
                equinoBaixado.getEquino().getSituacao(),
                equinoBaixado.getDataBaixa(),
                equinoBaixado.getDataRetorno()
        );
    }
}
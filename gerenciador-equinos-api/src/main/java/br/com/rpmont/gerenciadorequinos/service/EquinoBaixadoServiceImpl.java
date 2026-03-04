package br.com.rpmont.gerenciadorequinos.service;

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
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"));

        if("Baixado".equalsIgnoreCase(equinoExistente.getSituacao())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Equino já está com status Baixado");
        }

        equinoExistente.setSituacao("Baixado");
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
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"));

        EquinoBaixado baixaAberta = baixadoRepository
                .findFirstByEquinoIdAndDataRetornoIsNullOrderByDataBaixaDesc(equinoId)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.CONFLICT,
                        "Não existe baixa aberta para este equino (não há registro com data de retorno!"));

        baixaAberta.setDataRetorno(LocalDate.now());
        baixadoRepository.save(baixaAberta);

        equinoExistente.setSituacao("Ativo");
        equinoRepository.save(equinoExistente);

    }

    @Override
    public List<EquinoBaixado> equinoBaixadoId(Long equinoId) {

        if(!equinoRepository.existsById(equinoId)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Equino não encontrado no banco de dados!");
        }
        return baixadoRepository.findByEquinoIdOrderByDataBaixaDesc(equinoId);
    }

    @Override
    public List<EquinoBaixado> listarTodosBaixados() {
        return baixadoRepository.findAll();
    }
}

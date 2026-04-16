package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoCurativoEquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoCurativoEquinoResponse;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoRepregoEquinoResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface FerrageamentoCurativoEquinoService {

    FerrageamentoCurativoEquinoResponse criarFerrageamentoCurativo (FerrageamentoCurativoEquinoRequest ferrageamentoCurativoEquinoRequest);

    List<FerrageamentoCurativoEquinoResponse> listarTodosFerrageamentoCurativoEquino();

    FerrageamentoCurativoEquinoResponse buscarFerrageamentoCurativoId(Long id);

    FerrageamentoCurativoEquinoResponse atualizarFerrageamentoCurativoId(Long id, FerrageamentoCurativoEquinoRequest ferrageamentoCurativoEquinoRequest);

    void deletarFerrageamentoCurativoId(long id);
}

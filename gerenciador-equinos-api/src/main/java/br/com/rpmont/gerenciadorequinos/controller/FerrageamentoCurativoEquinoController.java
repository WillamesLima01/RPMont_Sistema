package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoCurativoEquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoCurativoEquinoResponse;
import br.com.rpmont.gerenciadorequinos.service.FerrageamentoCurativoEquinoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ferrageamento_curativo_equino")
@RequiredArgsConstructor
public class FerrageamentoCurativoEquinoController {

    private final FerrageamentoCurativoEquinoService ferrageamentoCurativoEquinoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FerrageamentoCurativoEquinoResponse criarFerrageamentoCurativo(
            @Valid @RequestBody FerrageamentoCurativoEquinoRequest ferrageamentoCurativoEquinoRequest) {
        return ferrageamentoCurativoEquinoService.criarFerrageamentoCurativo(ferrageamentoCurativoEquinoRequest);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<FerrageamentoCurativoEquinoResponse> listarTodosFerrageamentoCurativoEquino() {
        return ferrageamentoCurativoEquinoService.listarTodosFerrageamentoCurativoEquino();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public FerrageamentoCurativoEquinoResponse buscarFerrageamentoCurativoId(@PathVariable Long id) {
        return ferrageamentoCurativoEquinoService.buscarFerrageamentoCurativoId(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public FerrageamentoCurativoEquinoResponse atualizarFerrageamentoCurativoId(
            @PathVariable Long id, @Valid @RequestBody FerrageamentoCurativoEquinoRequest ferrageamentoCurativoEquinoRequest) {
        return ferrageamentoCurativoEquinoService.atualizarFerrageamentoCurativoId(id, ferrageamentoCurativoEquinoRequest);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarFerrageamentoCurativoId(@PathVariable Long id) {
        ferrageamentoCurativoEquinoService.deletarFerrageamentoCurativoId(id);
    }
}

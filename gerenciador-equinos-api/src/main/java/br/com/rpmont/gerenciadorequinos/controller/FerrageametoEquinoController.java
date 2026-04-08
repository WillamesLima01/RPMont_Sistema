package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoEquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoEquinoResponse;
import br.com.rpmont.gerenciadorequinos.service.FerrageamentoEquinoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ferrageamento_equino")
@RequiredArgsConstructor
public class FerrageametoEquinoController {

    private final FerrageamentoEquinoService ferrageamentoEquinoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FerrageamentoEquinoResponse criarFerrageamento(@Valid @RequestBody FerrageamentoEquinoRequest ferrageamentoEquinoRequest){

        return ferrageamentoEquinoService.criarFerrageamento(ferrageamentoEquinoRequest);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<FerrageamentoEquinoResponse> listarTodosFerrageamentoEquino(){

        return ferrageamentoEquinoService.listarTodosFerrageamentoEquino();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public FerrageamentoEquinoResponse buscarFerrageamentoId(@PathVariable Long id){

        return ferrageamentoEquinoService.buscarFerrageamentoId(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public FerrageamentoEquinoResponse atualizarFerrageamentoId(
            @PathVariable Long id,
            @Valid @RequestBody FerrageamentoEquinoRequest ferrageamentoEquinoRequest){

        return ferrageamentoEquinoService.atualizarFerrageamentoId(id, ferrageamentoEquinoRequest);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarFerrageamentoId(@PathVariable Long id){

        ferrageamentoEquinoService.deletarFerrageamentoId(id);
    }
}

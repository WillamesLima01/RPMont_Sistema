package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoRepregoEquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.FerrageamentoRepregoEquinoResponse;
import br.com.rpmont.gerenciadorequinos.service.FerrageamentoRepregoEquinoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ferrageamento_reprego_equino")
@RequiredArgsConstructor
public class FerrageamentoRepregoEquinoController {

    private final FerrageamentoRepregoEquinoService ferrageamentoRepregoEquinoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FerrageamentoRepregoEquinoResponse criarFerrageamentoReprego(
            @Valid @RequestBody FerrageamentoRepregoEquinoRequest ferrageamentoRepregoEquinoRequest){

        return ferrageamentoRepregoEquinoService.criarFerrageamentoReprego(ferrageamentoRepregoEquinoRequest);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<FerrageamentoRepregoEquinoResponse>listarTodosFerrageamentoRepregoEquino(){

        return ferrageamentoRepregoEquinoService.listarTodosFerrageamentoRepregoEquino();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public FerrageamentoRepregoEquinoResponse buscarFerrageamentoRepregoId(@PathVariable Long id) {

        return ferrageamentoRepregoEquinoService.buscarFerrageamentoRepregoId(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public FerrageamentoRepregoEquinoResponse atualizarFerrageamentoRepregoId(
            @PathVariable Long id,
            @Valid @RequestBody FerrageamentoRepregoEquinoRequest ferrageamentoRepregoEquinoRequest){

        return ferrageamentoRepregoEquinoService.atualizarFerrageamentoRepregoId(
                id, ferrageamentoRepregoEquinoRequest);

    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarFerrageamentoRepregoId(@PathVariable Long id){

        ferrageamentoRepregoEquinoService.deletarFerrageamentoRepregoId(id);
    }

}

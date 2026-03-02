package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.EquinoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EquinoResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.service.EquinoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equino")
@RequiredArgsConstructor
public class EquinoController {

    private final EquinoService equinoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EquinoResponse criarEquino(@Valid @RequestBody EquinoRequest e) {

        return equinoService.criarEquino(e);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public Equino buscarEquinoId(@PathVariable Long id){

        return equinoService.buscarEquinoId(id);

    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<Equino> buscarTodosEquinos(){

        return equinoService.buscarTodosEquinos();
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public EquinoResponse atualizarEquino(@PathVariable Long id, @Valid @RequestBody EquinoRequest e){

        return equinoService.atualizarEquino(id, e);

    };

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarEquinoId(@PathVariable Long id) {

        equinoService.deletarEquinoId(id);

    }

}

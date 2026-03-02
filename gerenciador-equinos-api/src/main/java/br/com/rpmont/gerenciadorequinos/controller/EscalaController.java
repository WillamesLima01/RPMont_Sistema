package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.EscalaRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EscalaResponse;
import br.com.rpmont.gerenciadorequinos.model.Escala;
import br.com.rpmont.gerenciadorequinos.service.EscalaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/escala")
@RequiredArgsConstructor
public class EscalaController {

    private final EscalaService escalaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EscalaResponse criarEscala(@Valid @RequestBody EscalaRequest escalaRequest) {

        return escalaService.criarEscala(escalaRequest);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<Escala> buscarTodasEscalas(){

        return escalaService.buscarTodasEscalas();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public Escala buscarEscalaId(@PathVariable Long id){

        return escalaService.buscarEscalaId(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public EscalaResponse atualizarEscalaId(@PathVariable Long id, @Valid @RequestBody EscalaRequest escalaRequest) {

        return escalaService.atualizarEscalaId(id, escalaRequest);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarEscalaId(@PathVariable Long id){

        escalaService.deletarEscalaId(id);

    }
}

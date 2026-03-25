package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.ToaleteRequest;
import br.com.rpmont.gerenciadorequinos.dtos.ToaleteResponse;
import br.com.rpmont.gerenciadorequinos.service.ToaleteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/toalete")
@RequiredArgsConstructor
public class ToaleteController {

    private final ToaleteService toaleteService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ToaleteResponse criarToalete(@Valid @RequestBody ToaleteRequest toaleteRequest) {
        return toaleteService.criarToalete(toaleteRequest);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<ToaleteResponse> listarTodosToaletes() {
        return toaleteService.listartodosToaletes();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ToaleteResponse buscarToaleteId(@PathVariable Long id) {
        return toaleteService.buscarToaleteId(id);
    }

    @GetMapping("/equino/{equinoId}")
    @ResponseStatus(HttpStatus.OK)
    public List<ToaleteResponse> listarToaletesPorEquinoId(@PathVariable Long equinoId) {
        return toaleteService.listarToaletesPorEquinoId(equinoId);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ToaleteResponse atualizarToaleteId(@PathVariable Long id,
                                              @Valid @RequestBody ToaleteRequest toaleteRequest) {
        return toaleteService.atualizarToaleteId(id, toaleteRequest);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarToaleteId(@PathVariable Long id) {
        toaleteService.deletarToaleteId(id);
    }
}
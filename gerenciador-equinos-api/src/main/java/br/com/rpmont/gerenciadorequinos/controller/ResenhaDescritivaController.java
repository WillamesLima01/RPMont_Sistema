package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaDetalheResponse;
import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaRequest;
import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaResponse;
import br.com.rpmont.gerenciadorequinos.service.ResenhaDescritivaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/resenha_descritiva")
@RequiredArgsConstructor
public class ResenhaDescritivaController {

    private final ResenhaDescritivaService resenhaDescritivaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResenhaDescritivaResponse criarResenhaDescritiva(
            @Valid @RequestBody ResenhaDescritivaRequest request
    ) {
        return resenhaDescritivaService.criarResenhaDecritiva(request);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResenhaDescritivaResponse atualizarResenhaDescritiva(
            @PathVariable Long id,
            @Valid @RequestBody ResenhaDescritivaRequest request
    ) {
        return resenhaDescritivaService.atualizarResenhaDescritiva(id, request);
    }

    @GetMapping("/{equinoId}")
    @ResponseStatus(HttpStatus.OK)
    public ResenhaDescritivaDetalheResponse buscarResenhaDescritivaId(@PathVariable Long equinoId) {
        return resenhaDescritivaService.buscarEquinoId(equinoId);
    }

}

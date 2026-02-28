package br.com.rpmont.gerenciadorequinos.controller;

<<<<<<< HEAD
=======
import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaDetalheResponse;
>>>>>>> ea6d8fd (atualizado)
import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaRequest;
import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaResponse;
import br.com.rpmont.gerenciadorequinos.model.ResenhaDescritiva;
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

<<<<<<< HEAD
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResenhaDescritiva buscarResenhaDescritivaId(@PathVariable Long id) {
        return resenhaDescritivaService.buscarResenhaDescritivaId(id);
    }
=======
    @GetMapping("/{equinoId}")
    @ResponseStatus(HttpStatus.OK)
    public ResenhaDescritivaDetalheResponse buscarResenhaDescritivaId(@PathVariable Long equinoId) {
        return resenhaDescritivaService.buscarEquinoId(equinoId);
    }

>>>>>>> ea6d8fd (atualizado)
}

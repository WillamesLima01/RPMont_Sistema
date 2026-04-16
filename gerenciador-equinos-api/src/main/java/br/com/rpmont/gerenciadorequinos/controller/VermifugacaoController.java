package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.VermifugacaoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.VermifugacaoResponse;
import br.com.rpmont.gerenciadorequinos.service.VermifugacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vermifugacao")
@RequiredArgsConstructor
public class VermifugacaoController {

    private final VermifugacaoService vermifugacaoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VermifugacaoResponse criarVermifugacao(@Valid @RequestBody VermifugacaoRequest vermifugacaoRequest) {
        return vermifugacaoService.criarVermifugacao(vermifugacaoRequest);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<VermifugacaoResponse> listarTodasVermifugacao(){
        return vermifugacaoService.listarTodasVermifugacao();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public VermifugacaoResponse buscarVermifugacaoId(@PathVariable Long id) {
        return vermifugacaoService.buscaVermifugacaoId(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public VermifugacaoResponse atualizarVermifugacaoId(@PathVariable Long id, @Valid @RequestBody VermifugacaoRequest vermifugacaoRequest) {
        return vermifugacaoService.atualizarVermifugacaoId(id, vermifugacaoRequest);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarVermifugacaoId(@PathVariable Long id) {
        vermifugacaoService.deletarVermifugacaoId(id);
    }
}

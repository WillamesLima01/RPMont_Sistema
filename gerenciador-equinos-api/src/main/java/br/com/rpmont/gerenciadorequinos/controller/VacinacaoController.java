package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.VacinacaoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.VacinacaoResponse;
import br.com.rpmont.gerenciadorequinos.service.VacinacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vacinacao")
@RequiredArgsConstructor
public class VacinacaoController {

    private final VacinacaoService vacinacaoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VacinacaoResponse criarVacinacao(@Valid @RequestBody VacinacaoRequest vacinacaoRequest) {
        return vacinacaoService.criarVacinacao(vacinacaoRequest);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<VacinacaoResponse> listarTodasVacinacao() {
        return vacinacaoService.listarTodasVacinacao();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public VacinacaoResponse buscarVacinacaoId(@PathVariable Long id) {
        return vacinacaoService.buscaVacinacaoId(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public VacinacaoResponse atualizarVacinacaoId(@PathVariable Long id, @Valid @RequestBody VacinacaoRequest vacinacaoRequest) {
        return vacinacaoService.atualizarVacinacaoId(id, vacinacaoRequest);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarVacinacaoId(@PathVariable Long id) {
        vacinacaoService.deletarVacinacaoId(id);
    }

}

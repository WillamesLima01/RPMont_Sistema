package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.EntradaMedicamentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EntradaMedicamentoResponse;
import br.com.rpmont.gerenciadorequinos.service.EntradaMedicamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/entradas_medicamento")
@RequiredArgsConstructor
public class EntradaMedicamentoController {

    private final EntradaMedicamentoService entradaMedicamentoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EntradaMedicamentoResponse salvarEntradaMedicamento(@Valid @RequestBody EntradaMedicamentoRequest entradaMedicamentoRequest) {

        return entradaMedicamentoService.salvarEntradaMedicamento(entradaMedicamentoRequest);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public EntradaMedicamentoResponse buscarEntradaMedicamentoId(@PathVariable Long id) {

        return entradaMedicamentoService.buscarEntradaMedicamentoId(id);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<EntradaMedicamentoResponse> ListarTodasEntradasMedicamento() {

        return entradaMedicamentoService.ListarTodasEntradasMedicamento();
    }

    @GetMapping("/medicamento/{medicamentoId}")
    @ResponseStatus(HttpStatus.OK)
    public List<EntradaMedicamentoResponse> buscarEntradasPorMedicamentoId(@PathVariable Long medicamentoId) {

        return entradaMedicamentoService.buscarEntradaPorMedicamentoId(medicamentoId);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public EntradaMedicamentoResponse atualizaEntradaMedicamentoId(
            @PathVariable Long id, @Valid @RequestBody EntradaMedicamentoRequest entradaMedicamentoRequest) {

        return entradaMedicamentoService.atualizarEntradaMedicamentoId(id, entradaMedicamentoRequest);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarEntradaMedicamentoId(@PathVariable Long id) {

        entradaMedicamentoService.deletarEntradaMedicamentoId(id);
    }



}

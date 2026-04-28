package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.SaidaMedicamentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.SaidaMedicamentoResponse;
import br.com.rpmont.gerenciadorequinos.service.SaidaMedicamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/saidas_medicamento")
@RequiredArgsConstructor
public class SaidaMedicamentoController {

    private final SaidaMedicamentoService saidaMedicamentoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SaidaMedicamentoResponse salvarSaidaMedicamento(
            @Valid @RequestBody SaidaMedicamentoRequest saidaMedicamentoRequest) {
        return saidaMedicamentoService.salvarSaidaMedicamento(saidaMedicamentoRequest);
    }

    @GetMapping("/{id}")
    public SaidaMedicamentoResponse buscarSaidaMedicamentoId(@PathVariable Long id) {
        return saidaMedicamentoService.buscarSaidaMedicamentoId(id);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<SaidaMedicamentoResponse> listarTodasSaidasMedicamento() {
        return saidaMedicamentoService.listarTodasSaidasMedicamentos();
    }

    @GetMapping("/medicamento/{medicamentoId}")
    @ResponseStatus(HttpStatus.OK)
    public List<SaidaMedicamentoResponse> buscarSaidaPorMedicamentoId(@PathVariable Long medicamentoId) {
        return saidaMedicamentoService.buscarSaidasPorMedicamentosId(medicamentoId);
    }

    @RequestMapping("/equino/{equinoId}")
    @ResponseStatus(HttpStatus.OK)
    public List<SaidaMedicamentoResponse> buscarSaidaPorEquinoId(@PathVariable Long equinoId) {
        return saidaMedicamentoService.buscarSaidaPorEquinoId(equinoId);
    }

    @GetMapping("/atendimento/{atendimentoId}")
    @ResponseStatus(HttpStatus.OK)
    public List<SaidaMedicamentoResponse> buscarSaidasPorAtendimentosId(@PathVariable Long atendimentoId) {
        return saidaMedicamentoService.buscarSaidasPorAtendimentosId(atendimentoId);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public SaidaMedicamentoResponse atualizarSaidaMedicamentoId(@PathVariable Long id, @Valid @RequestBody SaidaMedicamentoRequest saidaMedicamentoRequest) {
        return saidaMedicamentoService.atualizarSaidamedicamentoId(id, saidaMedicamentoRequest);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarSaidaMedicamentoId(@PathVariable Long id) {
        saidaMedicamentoService.deletarSaidaMedicamentoId(id);
    }
}

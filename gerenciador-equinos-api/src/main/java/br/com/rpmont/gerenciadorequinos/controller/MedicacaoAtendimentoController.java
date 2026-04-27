package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.MedicacaoAtendimentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.MedicacaoAtendimentoResponse;
import br.com.rpmont.gerenciadorequinos.service.MedicacaoAtendimentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicacoes_atendimento")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MedicacaoAtendimentoController {

    private final MedicacaoAtendimentoService medicacaoAtendimentoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MedicacaoAtendimentoResponse salvarMedicacaoAtendimento(
            @RequestBody @Valid MedicacaoAtendimentoRequest request) {
        return medicacaoAtendimentoService.salvarMedicacaoAtendimento(request);
    }

    @GetMapping("/{id}")
    public MedicacaoAtendimentoResponse buscarMedicacaoAtendimentoId(@PathVariable Long id) {
        return medicacaoAtendimentoService.buscarMedicacaoAtendimentoId(id);
    }

    @GetMapping
    public List<MedicacaoAtendimentoResponse> listarTodasMedicacoesAtendimento() {
        return medicacaoAtendimentoService.listarTodasMedicacoesAtendimento();
    }

    @GetMapping("/atendimento/{atendimentoId}")
    public List<MedicacaoAtendimentoResponse> buscarMedicacoesPorAtendimentoId(@PathVariable Long atendimentoId) {
        return medicacaoAtendimentoService.buscarMedicacoesPorAtendimentoId(atendimentoId);
    }

    @GetMapping("/equino/{equinoId}")
    public List<MedicacaoAtendimentoResponse> buscarMedicacoesPorEquinoId(@PathVariable Long equinoId) {
        return medicacaoAtendimentoService.buscarMedicacoesPorEquinoId(equinoId);
    }

    @PutMapping("/{id}")
    public MedicacaoAtendimentoResponse atualizarMedicacaoAtendimentoId(
            @PathVariable Long id,
            @RequestBody @Valid MedicacaoAtendimentoRequest request) {
        return medicacaoAtendimentoService.atualizarMedicacaoAtendimentoId(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarMedicacaoAtendimentoId(@PathVariable Long id) {
        medicacaoAtendimentoService.deletarMedicacaoAtendimentoId(id);
    }
}
package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.MedicamentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.MedicamentoResponse;
import br.com.rpmont.gerenciadorequinos.service.MedicamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicamentos")
@RequiredArgsConstructor
public class MedicamentoController {

    private final MedicamentoService medicamentoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MedicamentoResponse salvarMedicamento(@Valid @RequestBody MedicamentoRequest medicamentoRequest){
        return medicamentoService.salvarMedicamento(medicamentoRequest);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public MedicamentoResponse buscarMedicamentoId(@PathVariable Long id) {
        return medicamentoService.buscarMedicamentoId(id);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<MedicamentoResponse> listarTodosMedicamentos() {
        return medicamentoService.listarTodosMedicamentos();
    }

    @GetMapping("/ativos")
    @ResponseStatus(HttpStatus.OK)
    public List<MedicamentoResponse> listarTodosMedicamentosAtivos() {
        return medicamentoService.listarTodosMedicamentosAtivos();
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public MedicamentoResponse atualizaMedicamentoId(
            @PathVariable Long id, @Valid @RequestBody MedicamentoRequest medicamentoRequest) {
        return medicamentoService.atualizarMedicamentoId(id, medicamentoRequest);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarMedicamentoId(@PathVariable Long id) {
        medicamentoService.deletarMedicamentoId(id);
    }
}

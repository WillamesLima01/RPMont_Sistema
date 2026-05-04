package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.EquinoBaixadoResponse;
import br.com.rpmont.gerenciadorequinos.service.EquinoBaixadoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equino")
@RequiredArgsConstructor
public class EquinoBaixadoController {

    private final EquinoBaixadoService equinoBaixadoService;

    @PostMapping("/{equinoId}/baixar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void baixarEquino(@PathVariable Long equinoId) {
        equinoBaixadoService.baixarEquino(equinoId);
    }

    @PostMapping("/{equinoId}/retornar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void retornarEquino(@PathVariable Long equinoId) {
        equinoBaixadoService.retornarEquino(equinoId);
    }

    @GetMapping("/{equinoId}/baixas")
    @ResponseStatus(HttpStatus.OK)
    public List<EquinoBaixadoResponse> equinoBaixadoId(@PathVariable Long equinoId) {
        return equinoBaixadoService.equinoBaixadoId(equinoId);
    }

    @GetMapping("/baixados")
    @ResponseStatus(HttpStatus.OK)
    public List<EquinoBaixadoResponse> listarTodosBaixados() {
        return equinoBaixadoService.listarTodosBaixados();
    }
}
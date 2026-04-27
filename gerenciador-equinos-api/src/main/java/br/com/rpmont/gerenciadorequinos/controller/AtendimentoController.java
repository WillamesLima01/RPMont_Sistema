package br.com.rpmont.gerenciadorequinos.controller;

import br.com.rpmont.gerenciadorequinos.dtos.AtendimentosRequest;
import br.com.rpmont.gerenciadorequinos.dtos.AtendimentosResponse;
import br.com.rpmont.gerenciadorequinos.service.AtendimentosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/atendimentos")
@RequiredArgsConstructor
public class AtendimentoController {

        private final AtendimentosService atendimentosService;

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        public AtendimentosResponse criarAtendimentos(@RequestBody @Valid AtendimentosRequest atendimentosRequest) {
            return atendimentosService.criarAtendimentos(atendimentosRequest);
        }

        @GetMapping
        @ResponseStatus(HttpStatus.OK)
        public List<AtendimentosResponse> buscarTodosAtendimentos() {
            return atendimentosService.buscarTodosAtendimentos();
        }

        @GetMapping("/{id}")
        @ResponseStatus(HttpStatus.OK)
        public AtendimentosResponse buscarAtendimentoId(@PathVariable Long id) {
            return atendimentosService.buscarAtendimentoId(id);
        }

        @PutMapping("/{id}")
        @ResponseStatus(HttpStatus.OK)
        public AtendimentosResponse atualizarAtendimentoId(
                @PathVariable Long id,
                @RequestBody @Valid AtendimentosRequest atendimentosRequest
        ) {
            return atendimentosService.atualizarAtendimentoId(id, atendimentosRequest);
        }

        @DeleteMapping("/{id}")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public void deletarAtendimentoId(@PathVariable Long id) {
            atendimentosService.deletarAtendimentoId(id);
        }
}




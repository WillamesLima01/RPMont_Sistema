package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AtendimentosRequest(

        @NotNull(message = "Equino deve ser informado")
        Long equinoId,

        @NotBlank(message = "O texto de atendimento não pode ser em branco")
        @Size(max = 255, message = "O texto deve ter no máximo 255 caracteres")
        String textoConsulta,

        @NotBlank(message = "Enfermidade deve ser informada")
        @Size(max = 80, message = "A enfermidade dever ter no máximo 80 caracteres")
        String enfermidade,

        LocalDate dataAtendimento
) {
}

package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.*;

public record EscalaRequest(

        @NotNull(message = "Equino deve ser informado")
        Long equinoId,

        @NotBlank(message = "Local de trabalho tem que ser informado")
        @Size(max = 120, message = "Local de trabalho tem que ter no máximo 120 caracteres")
        String localTrabalho,

        @NotBlank(message = "Jornada de trabalho deve ser informada")
        @Size(max = 50, message = "Jornada deve ter no máximo 50 caracteres")
        String jornadaTrabalho,

        @NotBlank(message = "Cavaleiro deve ser informado")
        @Size(max = 80, message = "Cavaleiro deve ter no máximo 80 caracteres")
        String cavaleiro,

        @NotNull(message = "Carga horária deve ser informada")
        @Min(value = 1, message = "Carga horária mínima é 1 hora")
        @Max(value = 24, message = "Carga horária máxima é 24 horas")
        Integer cargaHoraria
) {}
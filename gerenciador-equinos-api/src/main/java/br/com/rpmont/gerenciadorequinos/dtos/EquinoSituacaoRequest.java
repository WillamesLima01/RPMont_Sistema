package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.NotBlank;

public record EquinoSituacaoRequest(
        @NotBlank(message = "A situação do equino é obrigatória.")
        String situacao
) {
}

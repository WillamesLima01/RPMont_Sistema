package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ToaleteRequest(

        @NotNull(message = "O ID do equino é obrigatório.")
        Long equinoId,

        boolean tosa,
        boolean banho,
        boolean limpezaOuvidos,
        boolean limpezaGenital,
        boolean limpezaCascos,
        boolean ripagemCrina,
        boolean ripagemCola,
        boolean escovacao,
        boolean rasqueamento,

        String observacao

) {
}

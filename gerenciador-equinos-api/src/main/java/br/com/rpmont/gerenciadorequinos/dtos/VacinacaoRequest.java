package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record VacinacaoRequest(

        @NotNull(message = "O equinoId é obrigatório.")
        Long equinoId,

        @NotBlank(message = "O nome da vacina é obrigatório.")
        String nomeVacina,

        String observacao,

        LocalDate dataProximoProcedimento
) {
}

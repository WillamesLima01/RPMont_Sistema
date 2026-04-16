package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record VermifugacaoRequest(

        @NotNull(message = "O equinoId é obrigatório.")
        Long equinoId,

        @NotBlank(message = "O vermifugo é obrigatório.")
        String vermifugo,

        String observacao,

        LocalDate dataProximoProcedimento
) {
}

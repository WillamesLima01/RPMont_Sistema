package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.NotNull;

public record FerrageamentoCurativoEquinoRequest(

        @NotNull(message = "O equinoId é obrigatório.")
        Long equinoId,

        @NotNull(message = "O tipo de curativo é obrigatório.")
        String tipoCurativo,

        String observacoes
) {
}

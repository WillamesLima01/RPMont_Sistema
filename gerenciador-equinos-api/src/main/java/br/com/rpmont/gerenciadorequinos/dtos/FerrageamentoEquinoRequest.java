package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record FerrageamentoEquinoRequest(

        @NotNull(message = "O equinoId é obrigatório.")
        Long equinoId,

        @NotNull(message = "O tipo da ferradura é obrigatório.")
        String tipoFerradura,

        @NotNull(message = "O tipo de cravo é obrigatório.")
        String tipoCravo,

        @NotNull(message = "O tipo da justura é obrigatório.")
        String tipoJustura,

        @NotNull(message = "O tipo de ferrageamento é obrigatório.")
        String tipoFerrageamento,

        @NotNull(message = "A quantidade de ferros é obrigatória.")
        @Min(value = 0, message = "A quantidade de ferros não pode ser negativa.")
        Integer ferros,

        @NotNull(message = "A quantidade de cravos é obrigatória.")
        @Min(value = 0, message = "A quantidade de cravos não pode ser negativa.")
        Integer cravos,

        String observacoes,

        LocalDate dataProximoProcedimento
) {
}

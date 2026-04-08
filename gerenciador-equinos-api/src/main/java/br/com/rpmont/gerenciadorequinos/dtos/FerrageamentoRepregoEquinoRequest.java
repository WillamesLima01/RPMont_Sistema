package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record FerrageamentoRepregoEquinoRequest(

        @NotNull(message = "O equinoId é obrigatório.")
        Long equinoId,

        @NotNull(message = "Informe ao menos uma pata.")
        List<String> patas,

        @NotNull(message = "Informe se utilizou ferro novo.")
        String ferroNovo,

        @NotNull(message = "A quantidade de cravos usados é obrigatória.")
        @Min(value = 0, message = "A quantidade de cravos usados não pode ser negativa.")
        Integer cravosUsados,

        String observacoes

) {
}

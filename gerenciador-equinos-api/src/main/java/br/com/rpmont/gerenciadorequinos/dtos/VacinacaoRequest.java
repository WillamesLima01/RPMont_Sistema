package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record VacinacaoRequest(

        @NotNull(message = "O equino deve ser informado")
        Long equinoId,

        @NotBlank(message = "A vacina deve ser informada")
        String nomeVacina,

        @NotNull(message = "A quantidade do medicamento deve ser informada")
        @DecimalMin(value = "0.01", message = "A quantidade deve ser maior que zero")
        BigDecimal qtdeMedicamento,

        @NotBlank(message = "A unidade do medicamento deve ser informada")
        String unidadeMedicamento,

        @Size(max = 1000, message = "A observação não pode ter mais de 1000 caracteres")
        String observacao,

        LocalDate dataProximoProcedimento
) {
}
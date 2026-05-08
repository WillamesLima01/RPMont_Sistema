package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record VermifugacaoRequest(

        @NotNull(message = "O equinoId é obrigatório.")
        Long equinoId,

        @NotBlank(message = "O vermifugo é obrigatório.")
        String vermifugo,

        @NotNull(message = "A quantidade do medicamento deve ser informada")
        @DecimalMin(value = "0.01", message = "A quantidade deve ser maior que zero")
        BigDecimal qtdeMedicamento,

        @NotBlank(message = "A unidade do medicamento deve ser informada")
        String unidadeMedicamento,

        String observacao,

        LocalDateTime dataCadastro,

        LocalDate dataProximoProcedimento
) {
}

package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EntradaMedicamentoRequest(

        @NotNull(message = "O medicamento deve ser informado.")
        Long medicamentoId,

        @NotBlank(message = "O lote deve ser informado.")
        @Size(max = 100, message = "O lote não pode ter mais de 100 caracteres.")
        String lote,

        @NotNull(message = "A validade deve ser informada.")
        LocalDate validade,

        @NotNull(message = "A quantidade de apresentações deve ser informada.")
        @Positive(message = "A quantidade de apresentações deve ser maior que zero.")
        Integer quantidadeApresentacoes,

        @NotNull(message = "A data de entrada deve ser informada.")
        LocalDate dataEntrada,

        @NotBlank(message = "O fornecedor deve ser informado.")
        @Size(max = 150, message = "O fornecedor não pode ter mais de 150 caracteres.")
        String fornecedor,

        @NotNull(message = "O valor unitário deve ser informado.")
        @DecimalMin(value = "0.01", message = "O valor unitário deve ser maior que zero.")
        BigDecimal valorUnitario,

        @Size(max = 1000, message = "A observação não pode ter mais de 1000 caracteres.")
        String observacao

) {
}

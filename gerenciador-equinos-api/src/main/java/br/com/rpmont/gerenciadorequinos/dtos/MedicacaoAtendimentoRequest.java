package br.com.rpmont.gerenciadorequinos.dtos;

import br.com.rpmont.gerenciadorequinos.enums.OrigemMedicamentoEnum;
import br.com.rpmont.gerenciadorequinos.enums.UnidadeMedidaEnum;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MedicacaoAtendimentoRequest(

        @NotNull(message = "O atendimento deve ser informado")
        Long atendimentoId,

        @NotNull(message = "O equino deve ser informado")
        Long equinoId,

        @NotNull(message = "A origem do medicamento deve ser informada")
        OrigemMedicamentoEnum origem,

        Long medicamentoId,

        @NotBlank(message = "O nome do medicamento deve ser informado")
        @Size(max = 150, message = "O nome do medicamento não pode ter mais de 150 caracteres")
        String nomeMedicamento,

        @NotNull(message = "A dose aplicada deve ser informada")
        @DecimalMin(value = "0.01", message = "A dose aplicada deve ser maior que zero")
        BigDecimal doseAplicada,

        @NotNull(message = "A unidade deve ser informada")
        UnidadeMedidaEnum unidade,

        @Size(max = 1000, message = "A observação não pode ter mais de 1000 caracteres")
        String observacao,

        @NotNull(message = "A data deve ser informada")
        LocalDate data
) {
}
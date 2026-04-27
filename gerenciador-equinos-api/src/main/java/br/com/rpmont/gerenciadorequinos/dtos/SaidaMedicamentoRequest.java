package br.com.rpmont.gerenciadorequinos.dtos;

import br.com.rpmont.gerenciadorequinos.enums.TipoSaidaMedicamentoEnum;
import br.com.rpmont.gerenciadorequinos.enums.UnidadeMedidaEnum;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SaidaMedicamentoRequest(

        @NotNull(message = "O medicamento deve ser informado")
        Long medicamentoId,

        @NotNull(message = "O tipo de saída deve ser informado")
        TipoSaidaMedicamentoEnum tipoSaida,

        @NotNull(message = "A quantidade informada deve ser informada")
        @DecimalMin(value = "0.01", message = "A quantidade informada deve ser maior que zero")
        BigDecimal quantidadeInformada,

        @NotNull(message = "A unidade informada deve ser informada")
        UnidadeMedidaEnum unidadeInformada,

        @NotNull(message = "A data da saída deve ser informada")
        LocalDate dataSaida,

        @Size(max = 1000, message = "A observação não pode ter mais de 1000 caracteres")
        String observacao,

        Long EquinoId,

        @Size(max = 150, message = "O nome do equino não pode ter mais de 150 caracteres")
        String nomeEquino,

        @Size(max = 100, message = "O atendimentoId não pode ter mais de 100 caracteres")
        String atendimentoId
) {
}
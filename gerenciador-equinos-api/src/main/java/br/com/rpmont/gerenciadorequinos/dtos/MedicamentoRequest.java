package br.com.rpmont.gerenciadorequinos.dtos;

import br.com.rpmont.gerenciadorequinos.enums.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record MedicamentoRequest(

        @NotBlank(message = "O nome do medicamento é obrigatório.")
        @Size(max = 150, message = "O nome do medicamento não pode ter mais que 100 caracteres.")
        String nome,

        @Size(max = 200, message = "O nome comercial não pode ter mais de 200 caracteres.")
        String nomeComercial,

        @Size(max = 150, message = "O fabricante não pode ter mais de 150 caracteres.")
        String fabricante,

        @NotNull(message = "A categoria é obrigatória.")
        CategoriaMedicamentoEnum categoria,

        @NotNull(message = "A forma farmacêutica deve ser informada.")
        FormaFarmaceuticaEnum forma,

        @Size(max = 1000, message = "A observação não pode ter mais de 1000 caracteres.")
        String observacao,

        @NotNull(message = "O tipo apresentação deve ser informado.")
        TipoApresentacaoEnum tipoApresentacao,

        @NotNull(message = "A quantidade por apresentação deve ser informada.")
        @DecimalMin(value = "0.01", message ="A quantidade por apresentação deve ser maior que zero." )
        BigDecimal quantidadePorApresentacao,

        @NotNull(message = "A unidade conteúdo deve ser informada.")
        UnidadeMedidaEnum unidadeConteudo,

        @NotNull(message = "A unidade base deve ser informada.")
        UnidadeMedidaEnum unidadeBase,

        @NotNull(message = "O tipo de unidade deve ser informado.")
        TipoUnidadeEnum tipoUnidadeEnum,

        @NotNull(message = "Informe se o medicamento está ativo")
        Boolean ativo
) {
}

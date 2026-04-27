package br.com.rpmont.gerenciadorequinos.dtos;

import br.com.rpmont.gerenciadorequinos.enums.OrigemMedicamentoEnum;
import br.com.rpmont.gerenciadorequinos.enums.UnidadeMedidaEnum;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record MedicacaoAtendimentoResponse(
        Long id,
        Long atendimentoId,
        Long equinoId,
        String nomeEquino,
        OrigemMedicamentoEnum origem,
        Long medicamentoId,
        String nomeMedicamento,
        BigDecimal doseAplicada,
        UnidadeMedidaEnum unidade,
        String observacao,
        LocalDate data,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm
) {
}
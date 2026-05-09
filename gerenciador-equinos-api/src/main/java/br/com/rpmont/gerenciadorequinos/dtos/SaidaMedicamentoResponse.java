package br.com.rpmont.gerenciadorequinos.dtos;

import br.com.rpmont.gerenciadorequinos.enums.TipoSaidaMedicamentoEnum;
import br.com.rpmont.gerenciadorequinos.enums.UnidadeMedidaEnum;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SaidaMedicamentoResponse(

        Long id,
        Long medicamentoId,
        String medicamentoNome,
        String fabricante,
        Long atendimentoId,
        Long vermifugacaoId,
        Long vacinacaoId,
        Long equinoId,
        String equinoNome,
        TipoSaidaMedicamentoEnum tipoSaida,
        BigDecimal quantidadeInformada,
        UnidadeMedidaEnum unidadeInformada,
        BigDecimal quantidadeBase,
        UnidadeMedidaEnum unidadeBase,
        LocalDate dataSaida,
        String observacao,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm
) {
}
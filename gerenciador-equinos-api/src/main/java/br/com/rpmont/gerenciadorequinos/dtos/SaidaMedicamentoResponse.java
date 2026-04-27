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
        TipoSaidaMedicamentoEnum tipoSaida,
        BigDecimal quantidadeInformada,
        UnidadeMedidaEnum unidadeInformada,
        BigDecimal quantidadeBase,
        UnidadeMedidaEnum unidadeBase,
        LocalDate dataSaida,
        String observacao,
        Long idEquino,
        String nomeEquino,
        String atendimentoId,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm
) {
}
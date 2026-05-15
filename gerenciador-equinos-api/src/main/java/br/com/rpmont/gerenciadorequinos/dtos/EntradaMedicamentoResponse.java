package br.com.rpmont.gerenciadorequinos.dtos;

import br.com.rpmont.gerenciadorequinos.enums.FormaFarmaceuticaEnum;
import br.com.rpmont.gerenciadorequinos.enums.TipoApresentacaoEnum;
import br.com.rpmont.gerenciadorequinos.enums.TipoUnidadeEnum;
import br.com.rpmont.gerenciadorequinos.enums.UnidadeMedidaEnum;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record EntradaMedicamentoResponse(

        Long id,
        Long medicamentoId,
        String medicamentoNome,
        String fabricante,
        FormaFarmaceuticaEnum forma,
        TipoApresentacaoEnum tipoApresentacao,
        BigDecimal quantidadePorApresentacao,
        UnidadeMedidaEnum unidadeConteudo,
        UnidadeMedidaEnum unidadeBase,
        TipoUnidadeEnum tipoUnidadeEnum,
        String lote,
        LocalDate validade,
        BigDecimal quantidadeApresentacoes,
        BigDecimal quantidadeBase,
        LocalDate dataEntrada,
        String fornecedor,
        BigDecimal valorUnitario,
        BigDecimal valorTotal,
        String observacao,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm
) {
}

package br.com.rpmont.gerenciadorequinos.dtos;

import br.com.rpmont.gerenciadorequinos.enums.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MedicamentoResponse(

        Long id,
        String nome,
        String nomeComercial,
        String fabricante,
        CategoriaMedicamentoEnum categoria,
        FormaFarmaceuticaEnum forma,
        String observacao,
        TipoApresentacaoEnum tipoApresentacao,
        BigDecimal quantidadePorApresentacao,
        UnidadeMedidaEnum unidadeConteudo,
        UnidadeMedidaEnum unidadeBase,
        TipoUnidadeEnum tipoUnidadeEnum,
        Boolean ativo,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm

) {
}

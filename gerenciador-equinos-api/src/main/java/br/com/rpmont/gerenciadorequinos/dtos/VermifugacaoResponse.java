package br.com.rpmont.gerenciadorequinos.dtos;

import br.com.rpmont.gerenciadorequinos.enums.OrigemMedicamentoEnum;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record VermifugacaoResponse(
        Long id,
        Long equinoId,
        String nomeEquino,
        String vermifugo,
        BigDecimal qtdeMedicamento,
        String unidadeMedicamento,
        OrigemMedicamentoEnum origemMedicamento,
        Long medicamentoId,
        String medicamentoNome,
        String observacao,
        LocalDate dataProximoProcedimento,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm
) {
}

package br.com.rpmont.gerenciadorequinos.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record VacinacaoResponse(

        Long id,
        Long equinoId,
        String nomeEquino,
        String nomeVacina,
        BigDecimal qtdeMedicamento,
        String unidadeMedicamento,
        String observacao,
        LocalDate dataProximoProcedimento,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm
) {
}

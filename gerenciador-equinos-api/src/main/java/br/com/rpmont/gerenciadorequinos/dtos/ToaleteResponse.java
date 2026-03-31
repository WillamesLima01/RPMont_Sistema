package br.com.rpmont.gerenciadorequinos.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ToaleteResponse(

        Long id,
        Long equinoId,
        String nomeEquino,
        Boolean tosa,
        Boolean banho,
        Boolean limpezaOuvidos,
        Boolean limpezaGenital,
        Boolean limpezaCascos,
        Boolean ripagemCrina,
        Boolean ripagemCola,
        Boolean escovacao,
        Boolean rasqueamento,
        String observacao,
        LocalDateTime dataCadastro,
        LocalDate dataProximoProcedimento,
        LocalDateTime dataUpdate

) {
}

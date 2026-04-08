package br.com.rpmont.gerenciadorequinos.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record FerrageamentoEquinoResponse(

        Long id,
        Long equinoId,
        String nomeEquino,
        String tipoFerradura,
        String tipoCravo,
        String tipoJustura,
        String tipoFerrageamento,
        Integer ferros,
        Integer cravos,
        String observacoes,
        LocalDate dataProximoProcedimento,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm

) {
}

package br.com.rpmont.gerenciadorequinos.dtos;

import java.time.LocalDate;

public record AtendimentosResponse(

        Long id,
        Long equinoId,
        String textoAtendimento,
        String enfermidade,
        LocalDate dataAtendimento
) {
}

package br.com.rpmont.gerenciadorequinos.dtos;

import java.time.LocalDate;

public record AtendimentosResponse(

        Long id,
        String textoConsulta,
        String enfermidade,
        LocalDate dataAtendimento
) {
}

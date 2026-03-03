package br.com.rpmont.gerenciadorequinos.dtos;

import java.time.LocalDateTime;

public record EscalaResponse(

        Long id,
        EquinoResumoResponse equino,
        String localTrabalho,
        String jornadaTrabalho,
        String cavaleiro,
        String observacao,
        Integer cargaHoraria,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm

) {}

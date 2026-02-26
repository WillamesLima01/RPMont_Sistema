package br.com.rpmont.gerenciadorequinos.dtos;

import java.time.LocalDateTime;

public record EquinoResponse(
        Long id,
        String nome,
        Double altura,
        String raca,
        String situacao,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm
) {}

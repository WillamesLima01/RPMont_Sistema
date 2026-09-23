package br.com.rpmont.gerenciadorequinos.dtos;

import br.com.rpmont.gerenciadorequinos.enums.PelagemEquinoEnum;
import br.com.rpmont.gerenciadorequinos.enums.SexoEquinoEnum;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EquinoResponse(
        Long id,
        String nome,
        Double altura,
        String raca,
        LocalDate dataNascimento,
        String registro,
        PelagemEquinoEnum pelagem,
        Double peso,
        String local,
        SexoEquinoEnum sexo,
        String situacao,
        String fotoLadoEsquerdo,
        String fotoLadoDireito,
        String fotoChanfro,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm
) {
}
package br.com.rpmont.gerenciadorequinos.dtos;

public record EquinoResumoResponse(
        Long id,
        String nome,
        String registro,
        String situacao
) {}

package br.com.rpmont.gerenciadorequinos.dtos;

import java.time.LocalDate;

public record EquinoBaixadoResponse(
        Long id,
        Long equinoId,
        String nomeEquino,
        String situacao,
        LocalDate dataBaixa,
        LocalDate dataRetorno
)  {}
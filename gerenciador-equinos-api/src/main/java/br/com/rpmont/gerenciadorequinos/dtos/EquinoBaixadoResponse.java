package br.com.rpmont.gerenciadorequinos.dtos;

import java.time.LocalDate;

public record EquinoBaixadoResponse(
        Long id,
        Long equinoId,
        String nome,
        LocalDate dataBaixa,
        LocalDate dataRetorno
) {}
package br.com.rpmont.gerenciadorequinos.dtos;

import java.time.LocalDate;

public record EquinoBaixadoRequest(

        Long equinoid,
        LocalDate dataBaixa
) {
}

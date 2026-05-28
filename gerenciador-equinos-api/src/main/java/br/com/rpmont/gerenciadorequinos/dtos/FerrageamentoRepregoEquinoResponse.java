package br.com.rpmont.gerenciadorequinos.dtos;

import java.time.LocalDateTime;
import java.util.List;

public record FerrageamentoRepregoEquinoResponse(

        Long id,
        Long equinoId,
        String nomeEquino,

        Long ferrageamentoOrigemId,

        List<String> patas,
        String ferroNovo,
        String numeroFerro,
        Integer quantidadeFerraduras,
        Integer cravosUsados,

        String observacoes,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm
) {
}
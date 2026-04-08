package br.com.rpmont.gerenciadorequinos.dtos;

import java.time.LocalDateTime;
import java.util.List;

public record FerrageamentoRepregoEquinoResponse(

        Long id,
        Long equinoId,
        String nomeEquino,
        List<String> patas,
        String ferroNovo,
        Integer cravosUsados,
        String observacoes,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm
) {
}

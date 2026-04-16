package br.com.rpmont.gerenciadorequinos.dtos;

import java.time.LocalDateTime;

public record FerrageamentoCurativoEquinoResponse(

        Long id,
        Long equinoId,
        String nomeEquino,
        String tipoCurativo,
        String observacoes,
        LocalDateTime dataCadastro,
        LocalDateTime atualizadoEm
) {
}

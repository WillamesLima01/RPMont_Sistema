package br.com.rpmont.gerenciadorequinos.dtos;

public record ResenhaDescritivaDetalheResponse(

        Long id,
        Long equinoId,
        String descricao,
        String imgChanfro,
        String imgLadoDireito,
        String imgLadoEsquerdo
) {
}

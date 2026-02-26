package br.com.rpmont.gerenciadorequinos.dtos;

public record ResenhaDescritivaRequest(

        Long id,
        String descricao,
        String imgChanfro,
        String imgladoDireito,
        String imgladoEsquerdo
) {
}

package br.com.rpmont.gerenciadorequinos.dtos;

public record EscalaResponse(

    Long id,
    Long equinoId,
    String nomeEquino,
    String localTrabalho,
    String jornadaTrabalho,
    String cavaleiro,
    Integer cargaHoraria

) {
}

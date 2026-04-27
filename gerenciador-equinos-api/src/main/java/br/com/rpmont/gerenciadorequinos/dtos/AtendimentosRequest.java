package br.com.rpmont.gerenciadorequinos.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AtendimentosRequest(

        @NotBlank(message = "O texto da consulta deve ser informado")
        String textoConsulta,

        @NotBlank(message = "A enfermidade deve ser informada")
        String enfermidade,

        @NotNull(message = "O equino deve ser informado")
        Long equinoId,

        List<MedicacaoAtendimentoRequest> medicacoes
) {
}
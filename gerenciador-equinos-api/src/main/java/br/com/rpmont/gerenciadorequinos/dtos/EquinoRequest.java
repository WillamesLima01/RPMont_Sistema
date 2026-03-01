package br.com.rpmont.gerenciadorequinos.dtos;

import br.com.rpmont.gerenciadorequinos.enums.PelagemEquinoEnum;
import br.com.rpmont.gerenciadorequinos.enums.SexoEquinoEnum;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record EquinoRequest(

        @NotBlank(message = "O nome não pode ser em branco")
        @Size(max = 100, message = "O nome não pode ter mais de 100 caracteres")
        String nome,

        @Positive(message = "A altura deve ser maior que zero")
        Double altura,

        @NotBlank(message = "A raça deve ser informada")
        @Size(max = 60, message = "A raça não pode ter mais de 60 caracteres")
        String raca,

        @PastOrPresent(message = "A data de nascimento não pode ser futura")
        LocalDate dataNascimento,

        @NotBlank(message = "Informe o registro")
        String registro,

        @NotNull(message = "A pelagem deve ser informada")
        PelagemEquinoEnum pelagem,

        @Positive(message = "O peso deve ser maior que zero")
        Double peso,

        @NotBlank(message = "O local deve ser informado")
        @Size(max = 80, message = "O local não pode ter mais de 80 caracteres")
        String local,

       @NotNull(message = "O sexo deve ser informado")
       SexoEquinoEnum sexo,

        @NotBlank(message = "Informe a situação")
        String situacao
) {
}

package br.com.rpmont.gerenciadorequinos.model;

import br.com.rpmont.gerenciadorequinos.enums.PelagemEquinoEnum;
import br.com.rpmont.gerenciadorequinos.enums.SexoEquinoEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Table(name = "equino")
@Data
@Entity
public class Equino implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "altura", nullable = false)
    private Double altura;

    @Column(name = "raca", nullable = false, length = 50)
    private String raca;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

<<<<<<< HEAD
    @Column(name = "inclusao", nullable = false, length = 50)
    private String inclusao;
=======
    @Column(name = "registro", nullable = false, length = 50)
    private String registro;
>>>>>>> ea6d8fd (atualizado)

    @Column(name = "pelagem", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private PelagemEquinoEnum pelagem;

    @Column(name = "peso", nullable = false)
    private Double peso;

    @Column(name = "local", nullable = false, length = 50)
    private String local;

    @Column(name = "sexo", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private SexoEquinoEnum sexo;

    @Column(name = "situacao", nullable = false, length = 50)
    private String situacao;

    @Column(name = "data_cadastro", nullable = false)
    @CreationTimestamp
    private LocalDateTime dataCadastro;

    @Column(name = "atualizado_em")
    @UpdateTimestamp
    private LocalDateTime AtualizadoEm;

    @Column(name = "excluido", nullable = false)
    private Boolean excluido = false;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;

}

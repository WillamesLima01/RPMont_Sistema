package br.com.rpmont.gerenciadorequinos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "vacinacao")
@Entity
public class Vacinacao implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_vacina", nullable = false, length = 150)
    private String nomeVacina;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "qtde_medicamento", precision = 12, scale = 2)
    private BigDecimal qtdeMedicamento;

    @Column(name = "unidade_medicamento", length = 10)
    private String unidadeMedicamento;

    @Column(name = "data_proximo_procedimento")
    private LocalDate dataProximoProcedimento;

    @Column(name = "data_cadastro", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime dataCadastro;

    @Column(name = "atualizado_em")
    @UpdateTimestamp
    private LocalDateTime atualizadoEm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equino_id", nullable = false)
    private Equino equino;
}

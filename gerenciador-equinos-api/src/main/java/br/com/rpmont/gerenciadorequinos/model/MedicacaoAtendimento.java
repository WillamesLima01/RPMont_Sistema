package br.com.rpmont.gerenciadorequinos.model;

import br.com.rpmont.gerenciadorequinos.enums.OrigemMedicamentoEnum;
import br.com.rpmont.gerenciadorequinos.enums.UnidadeMedidaEnum;
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
@Entity
@Table(name = "medicacoes_atendimento")
public class MedicacaoAtendimento implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "atendimento_id", nullable = false)
    private Atendimentos atendimento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equino_id", nullable = false)
    private Equino equino;

    @Enumerated(EnumType.STRING)
    @Column(name = "origem", nullable = false, length = 20)
    private OrigemMedicamentoEnum origem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicamento_id")
    private Medicamento medicamento;

    @Column(name = "nome_medicamento", nullable = false, length = 150)
    private String nomeMedicamento;

    @Column(name = "dose_aplicada", nullable = false, precision = 12, scale = 2)
    private BigDecimal doseAplicada;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade", nullable = false, length = 10)
    private UnidadeMedidaEnum unidade;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @CreationTimestamp
    @Column(name = "data_cadastro", updatable = false)
    private LocalDateTime dataCadastro;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}
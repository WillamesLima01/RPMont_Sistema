package br.com.rpmont.gerenciadorequinos.model;

import br.com.rpmont.gerenciadorequinos.enums.TipoSaidaMedicamentoEnum;
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
@Table(name = "saidas_medicamento")
@Data
@Entity
public class SaidaMedicamento implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "medicamento_nome", nullable = false, length = 150)
    private String medicamentoNome;

    @Column(name = "fabricante", length = 150)
    private String fabricante;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_saida", nullable = false, length = 30)
    private TipoSaidaMedicamentoEnum tipoSaida;

    @Column(name = "quantidade_informada", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantidadeInformada;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_informada", nullable = false,length = 10)
    private UnidadeMedidaEnum unidadeInformada;

    @Column(name = "quantidade_base", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantidadeBase;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_base", nullable = false, length = 10)
    private UnidadeMedidaEnum unidadeBase;

    @Column(name = "data_saida", nullable = false)
    private LocalDate dataSaida;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atendimento_id", nullable = false)
    private Atendimentos atendimento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medicamento_id", nullable = false)
    private Medicamento medicamento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equino_id", nullable = false)
    private Equino equino;

    @Column(name = "nome_equino", length = 150)
    private String EquinoNome;

    @CreationTimestamp
    @Column(name = "data_cadastro", nullable = false)
    private LocalDateTime dataCadastro;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

}

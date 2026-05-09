package br.com.rpmont.gerenciadorequinos.model;

import br.com.rpmont.gerenciadorequinos.enums.FormaFarmaceuticaEnum;
import br.com.rpmont.gerenciadorequinos.enums.TipoApresentacaoEnum;
import br.com.rpmont.gerenciadorequinos.enums.TipoUnidadeEnum;
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
@Table(name = "entradas_medicamento")
@Data
@Entity
public class EntradaMedicamento implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "medicamento_nome", nullable = false, length = 150)
    private  String medicamentoNome;

    @Column(name = "fabricante", length = 150)
    private String fabricante;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_farmaceutica", nullable = false, length = 30)
    private FormaFarmaceuticaEnum forma;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_apresentacao", nullable = false, length = 30)
    private TipoApresentacaoEnum tipoApresentacaoEnum;

    @Column(name = "quantidade_por_apresentacao", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantidadePorApresentacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_conteudo", nullable = false, length = 10)
    private UnidadeMedidaEnum unidadeConteudo;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_base", nullable = false, length = 10)
    private UnidadeMedidaEnum unidadeBase;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_unidade", nullable = false, length = 20)
    private TipoUnidadeEnum tipoUnidade;

    @Column(name = "lote", nullable = false, length = 100)
    private String lote;

    @Column(name = "validade", nullable = false)
    private LocalDate validade;

    @Column(name = "quantidade_apresentacoes", nullable = false)
    private Integer quantidadeApresentacoes;

    @Column(name = "quantidade_base", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantidadeBase;

    @Column(name = "data_entrada", nullable = false)
    private LocalDate dataEntrada;

    @Column(name = "fornecedor", nullable = false, length = 150)
    private String fornecedor;

    @Column(name = "valor_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorUnitario;

    @Column(name = "valor_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @CreationTimestamp
    @Column(name = "data_cadastro", updatable = false)
    private LocalDateTime dataCadastro;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medicamento_id", nullable = false)
    private Medicamento medicamento;

}

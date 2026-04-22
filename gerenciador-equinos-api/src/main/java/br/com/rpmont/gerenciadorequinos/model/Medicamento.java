package br.com.rpmont.gerenciadorequinos.model;

import br.com.rpmont.gerenciadorequinos.enums.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Table(name = "medicamentos")
@Data
@Entity
public class Medicamento implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @Column(name = "nome_comercial", length = 200)
    private String nomeComercial;

    @Column(name = "fabricante", length = 150)
    private String fabricante;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false, length = 30)
    private CategoriaMedicamentoEnum categoria;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma", nullable = false, length = 30)
    private FormaFarmaceuticaEnum forma;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_apresentacao", nullable = false, length = 30)
    private TipoApresentacaoEnum tipoApresentacao;

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
    private TipoUnidadeEnum tipoUnidadeEnum;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "data_cadastro", nullable = false)
    @CreationTimestamp
    private LocalDateTime dataCadastro;

    @Column(name = "atualizado_em")
    @UpdateTimestamp
    private LocalDateTime atualizadoEm;
}

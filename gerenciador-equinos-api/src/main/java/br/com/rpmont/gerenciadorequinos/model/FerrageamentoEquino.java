package br.com.rpmont.gerenciadorequinos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.xml.crypto.dsig.spec.XSLTTransformParameterSpec;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Table(name = "ferrageamentoEquino")
@Data
@Entity
public class FerrageamentoEquino implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_ferradura", nullable = false, length = 100)
    private String tipoFerradura;

    @Column(name = "tipo_cravo", nullable = false, length = 100)
    private String tipoCravo;

    @Column(name = "tipo_justura", nullable = false, length = 100)
    private String tipoJustura;

    @Column(name = "tipo_ferrageamento", nullable = false, length = 100)
    private String tipoFerrageamento;

    @Column(name = "ferros", nullable = false)
    private Integer ferros;

    @Column(name = "cravos", nullable = false)
    private Integer cravos;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

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

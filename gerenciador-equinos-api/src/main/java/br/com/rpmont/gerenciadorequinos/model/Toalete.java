package br.com.rpmont.gerenciadorequinos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.web.servlet.tags.form.TextareaTag;

import java.io.Serializable;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Table(name = "toalete")
@Data
@Entity
public class Toalete implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tosa", nullable = false)
    private Boolean tosa = false;

    @Column(name = "banho", nullable = false)
    private Boolean banho= false;

    @Column(name = "limpeza_ouvidos", nullable = false)
    private Boolean limpezaOuvidos = false;

    @Column(name = "limpeza_genital", nullable = false)
    private Boolean limpezaGenital = false;

    @Column(name = "limpeza_cascos", nullable = false)
    private Boolean limpezaCascos = false;

    @Column(name = "ripagem_crina", nullable = false)
    private Boolean ripagemCrina = false;

    @Column(name = "ripagem_cola", nullable = false)
    private Boolean ripagemCola = false;

    @Column(name = "escovacao", nullable = false)
    private Boolean escovacao = false;

    @Column(name = "rasqueamento", nullable = false)
    private Boolean rasqueamento = false;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "data_proximo_procedimento")
    private LocalDateTime dataProximoProcedimento;

    @CreationTimestamp
    @Column(name = "data_cadastro", nullable = false, updatable = false )
    private LocalDateTime dataCadastro;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equinoId", nullable = false)
    private Equino equino;

}

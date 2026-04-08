package br.com.rpmont.gerenciadorequinos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Table(name = "ferrageamento_reprego_equino")
@Data
@Entity
public class FerrageamentoRepregoEquino implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @CollectionTable(name = "ferrageamento_reprego_equino_patas",
                        joinColumns = @JoinColumn(name = "ferrageamento_reprego_id")
    )
    @Column(name = "pata", nullable = false)
    private List<String> patas;

    @Column(name = "ferro_novo", nullable = false, length = 20)
    private String ferroNovo;

    @Column(name = "cravos_usados", nullable = false)
    private String cravosUsados;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

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

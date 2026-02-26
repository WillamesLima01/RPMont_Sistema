package br.com.rpmont.gerenciadorequinos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(name = "resenha_descritiva")
@Entity
public class ResenhaDescritiva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "descricao", columnDefinition = "TEXT", nullable = false)
    private String descricao;

    @Lob
    @Column(name = "img_chanfro", columnDefinition = "TEXT")
    private String imgChanfro;

    @Lob
    @Column(name = "img_lado_direito", columnDefinition = "TEXT")
    private String img_lado_direito;

    @Lob
    @Column(name = "img_lado_esquerdo", columnDefinition = "TEXT")
    private String img_lado_esquerdo;

    @Column(name = "criado_em", nullable = false)
    @CreationTimestamp
    private LocalDate criadoEm;

    @Column(name = "atualizado_em")
    @UpdateTimestamp
    private LocalDate atualizadoEm;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equino_id", nullable = false, unique = true)
    private Equino equino;
}

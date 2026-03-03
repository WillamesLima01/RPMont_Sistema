package br.com.rpmont.gerenciadorequinos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Table(name = "escala")
@Data
@Entity
public class Escala implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "localTrabalho", nullable = false, length = 120)
    private String localTrabalho;

    @Column(name = "jornadaTrabalho", nullable = false, length = 50)
    private String jornadaTrabalho;

    @Column(name = "cavaleiro", nullable = false, length = 80)
    private String cavaleiro;

    @Column(name = "cargaHoraria", nullable = false)
    private Integer cargaHoraria;

    @Column(name = "observacao", length = 500)
    private String observacao;

    @CreationTimestamp
    @Column(name = "dataCadastro", nullable = false)
    private LocalDateTime dataCadastro;

    @Column(name = "atualizado_em")
    @UpdateTimestamp
    private LocalDateTime atualizadoEm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equinoId", nullable = false)
    private Equino equino;
}

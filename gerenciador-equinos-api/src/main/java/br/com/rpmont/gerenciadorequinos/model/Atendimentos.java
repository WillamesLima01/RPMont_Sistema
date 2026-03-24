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

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "atendimentos")
@Entity
public class Atendimentos implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "texto_consulta", nullable = false, length = 255)
    private String textoConsulta;

    @Column(name = "enfermidade", nullable = false, length = 50)
    private String enfermidade;

    @CreationTimestamp
    @Column(name = "data_atendimento", nullable = false)
    private LocalDate dataAtendimento;

    @Column(name = "atualizado_em")
    @UpdateTimestamp
    private LocalDateTime atualizadoEm;

    @Column(name = "excluido", nullable = false)
    private Boolean exluido = false;

    @Column(name = "data_exclusao", nullable = false)
    private LocalDateTime dataExclusao;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "equino_id", nullable = false)
    private Equino equino;
}

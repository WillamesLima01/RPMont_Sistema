package br.com.rpmont.gerenciadorequinos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "equino_baixado")
@Entity
public class EquinoBaixado implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "equino_id", nullable = false)
    private Equino equino;

    @Column(name = "data_baixa", nullable = false)
    private LocalDate dataBaixa;

    @Column(name = "data_retorno")
    private LocalDate dataRetorno;
}

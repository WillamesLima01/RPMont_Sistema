package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.Atendimentos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AtendimentosRepository extends JpaRepository<Atendimentos, Long> {

    @Query("""
        SELECT a
        FROM Atendimentos a
        JOIN FETCH a.equino e
        WHERE (:equinoId IS NULL OR e.id = :equinoId)
          AND (:dataInicio IS NULL OR a.dataAtendimento >= :dataInicio)
          AND (:dataFim IS NULL OR a.dataAtendimento <= :dataFim)
          AND a.excluido = false
        ORDER BY a.dataAtendimento DESC
    """)
    List<Atendimentos> filtrarAtendimentos(
            @Param("equinoId") Long equinoId,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim
    );
}
package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.Equino;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EquinoRepository extends JpaRepository<Equino, Long> {

    boolean existsByNomeAndDataNascimentoAndExcluidoFalse(String nome, LocalDate dataNascimento);

    List<Equino> findByExcluidoFalseOrderByNomeAsc();

    List<Equino> findByExcluidoFalseAndSituacaoIgnoreCaseOrderByNomeAsc(String situacao);
}
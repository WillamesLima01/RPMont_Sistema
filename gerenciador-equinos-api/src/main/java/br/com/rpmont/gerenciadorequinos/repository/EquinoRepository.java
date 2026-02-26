package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.Equino;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface EquinoRepository extends JpaRepository<Equino, Long> {

    boolean existsByNomeAndDataNascimento(String nome, LocalDate dataNascimento);
}

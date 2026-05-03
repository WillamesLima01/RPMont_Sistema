package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.Vacinacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VacinacaoRepository extends JpaRepository<Vacinacao, Long> {
}

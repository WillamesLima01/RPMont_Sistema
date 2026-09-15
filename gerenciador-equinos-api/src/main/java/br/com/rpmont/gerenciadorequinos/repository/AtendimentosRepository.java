package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.Atendimentos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AtendimentosRepository
        extends JpaRepository<Atendimentos, Long>,
        JpaSpecificationExecutor<Atendimentos> {
}
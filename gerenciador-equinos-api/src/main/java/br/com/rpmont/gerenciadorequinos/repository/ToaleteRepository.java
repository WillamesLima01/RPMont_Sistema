package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.Toalete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ToaleteRepository extends JpaRepository<Toalete, Long> {

    List<Toalete> findByEquinoId(Long equinoId);

}

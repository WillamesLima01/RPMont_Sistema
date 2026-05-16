package br.com.rpmont.gerenciadorequinos.repository;

import br.com.rpmont.gerenciadorequinos.model.EquinoBaixado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EquinoBaixadoRepository extends JpaRepository<EquinoBaixado, Long> {

    List<EquinoBaixado> findByEquinoIdOrderByDataBaixaDesc(Long equinoId);

    Optional<EquinoBaixado> findFirstByEquinoIdAndDataRetornoIsNullOrderByDataBaixaDesc(Long equinoId);

    @Query("""
        SELECT eb
        FROM EquinoBaixado eb
        JOIN FETCH eb.equino e
        WHERE LOWER(e.situacao) = LOWER(:situacao)
        ORDER BY eb.dataBaixa DESC
    """)
    List<EquinoBaixado> buscarBaixadosPorSituacaoEquino(@Param("situacao") String situacao);

    List<EquinoBaixado> findAllByOrderByDataBaixaDesc();
}
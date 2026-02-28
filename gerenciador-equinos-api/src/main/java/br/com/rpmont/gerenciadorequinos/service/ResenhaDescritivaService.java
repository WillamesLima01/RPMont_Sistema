package br.com.rpmont.gerenciadorequinos.service;

<<<<<<< HEAD
=======
import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaDetalheResponse;
>>>>>>> ea6d8fd (atualizado)
import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaRequest;
import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaResponse;
import br.com.rpmont.gerenciadorequinos.model.ResenhaDescritiva;
import org.springframework.stereotype.Service;

@Service
public interface ResenhaDescritivaService {

    ResenhaDescritivaResponse criarResenhaDecritiva(ResenhaDescritivaRequest resenhaDescritivaRequest);

    ResenhaDescritivaResponse atualizarResenhaDescritiva(Long id, ResenhaDescritivaRequest resenhaDescritivaRequest);

    ResenhaDescritiva buscarResenhaDescritivaId(Long equinoId);
<<<<<<< HEAD
=======

    ResenhaDescritivaDetalheResponse buscarEquinoId(Long equinoId);

>>>>>>> ea6d8fd (atualizado)
}

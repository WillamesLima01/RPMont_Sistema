package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaRequest;
import br.com.rpmont.gerenciadorequinos.dtos.ResenhaDescritivaResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.ResenhaDescritiva;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.ResenhaDescritivaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ResenhaDescritivaServiceImpl implements ResenhaDescritivaService{

    private final ResenhaDescritivaRepository resenhaDescritivaRepository;

    private final EquinoRepository equinoRepository;

    @Override
    public ResenhaDescritivaResponse criarResenhaDecritiva(ResenhaDescritivaRequest resenhaDescritivaRequest) {

        Equino equinoExistente = equinoRepository.findById(resenhaDescritivaRequest.id())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado!"));

        if(resenhaDescritivaRepository.findByEquinoId(equinoExistente.getId()).isPresent()){
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Equino já possui resenha cadastrada");
        }

        ResenhaDescritiva resenhaDescritiva = new ResenhaDescritiva();

        resenhaDescritiva.setDescricao(resenhaDescritivaRequest.descricao());
        resenhaDescritiva.setImgChanfro(resenhaDescritivaRequest.imgChanfro());
        resenhaDescritiva.setImg_lado_direito(resenhaDescritivaRequest.imgladoDireito());
        resenhaDescritiva.setImg_lado_esquerdo(resenhaDescritivaRequest.imgladoEsquerdo());
        resenhaDescritiva.setEquino(equinoExistente);

        resenhaDescritivaRepository.save(resenhaDescritiva);

        return new ResenhaDescritivaResponse(
                "Resenha criada com sucesso!",
                resenhaDescritiva.getId()
        );
    }

    @Override
    public ResenhaDescritivaResponse atualizarResenhaDescritiva(Long id, ResenhaDescritivaRequest resenhaDescritivaRequest) {
        Equino equinoExistente = equinoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado!"));

        ResenhaDescritiva resenhaDescritiva = resenhaDescritivaRepository.findByEquinoId(equinoExistente.getId())
                 .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                         "Resenha não encontrada no banco de dados"));


        resenhaDescritiva.setDescricao(resenhaDescritivaRequest.descricao());
        resenhaDescritiva.setImgChanfro(resenhaDescritivaRequest.imgChanfro());
        resenhaDescritiva.setImg_lado_direito(resenhaDescritivaRequest.imgladoDireito());
        resenhaDescritiva.setImg_lado_esquerdo(resenhaDescritivaRequest.imgladoEsquerdo());
        resenhaDescritiva.setEquino(equinoExistente);

        resenhaDescritivaRepository.save(resenhaDescritiva);

        return new ResenhaDescritivaResponse(
                "Resenha descritiva atualizada com sucesso!",
                resenhaDescritiva.getId()
        );
    }

    @Override
    public ResenhaDescritiva buscarResenhaDescritivaId(Long equinoId) {
        return resenhaDescritivaRepository.findByEquinoId(equinoId)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Resenha não encontrada no banco de dados!"));
    }
}

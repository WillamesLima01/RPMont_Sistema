package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.VermifugacaoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.VermifugacaoResponse;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.Vermifugacao;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.VermifugacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VermifugacaoServiceImpl implements VermifugacaoService {

    private final VermifugacaoRepository vermifugacaoRepository;
    private final EquinoRepository equinoRepository;

    @Override
    @Transactional
    public VermifugacaoResponse criarVermifugacao(VermifugacaoRequest vermifugacaoRequest) {
        Equino equinoExistente = equinoRepository.findById(vermifugacaoRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."));

        Vermifugacao criarVermifugacao = new Vermifugacao();

        preencherDadosVermifugacao(
                criarVermifugacao,
                vermifugacaoRequest,
                equinoExistente
        );

        Vermifugacao vermifugacaoSalva = vermifugacaoRepository.save(criarVermifugacao);

        return toResponse(vermifugacaoSalva);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VermifugacaoResponse> listarTodasVermifugacao() {
        return vermifugacaoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VermifugacaoResponse buscaVermifugacaoId(Long id) {
        Vermifugacao vermifugacaoExistente = vermifugacaoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Vermifugação não encontrada no banco de dados."));

        return toResponse(vermifugacaoExistente);
    }

    @Override
    @Transactional
    public VermifugacaoResponse atualizarVermifugacaoId(Long id, VermifugacaoRequest vermifugacaoRequest) {
        Equino equinoExistente = equinoRepository.findById(vermifugacaoRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."));

        Vermifugacao vermifugacaoExistente = vermifugacaoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Vermifugação não encontrada no banco de dados."));

        preencherDadosVermifugacao(
                vermifugacaoExistente,
                vermifugacaoRequest,
                equinoExistente
        );

        Vermifugacao vermifugacaoAtualizada = vermifugacaoRepository.save(vermifugacaoExistente);

        return toResponse(vermifugacaoAtualizada);
    }

    @Override
    @Transactional
    public void deletarVermifugacaoId(Long id) {
        Vermifugacao vermifugacaoExistente = vermifugacaoRepository.findById(id)
                        .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Vermifugação não encontrada no banco de dados."));

        vermifugacaoRepository.delete(vermifugacaoExistente);
    }

    private void preencherDadosVermifugacao(
            Vermifugacao vermifugacao,
            VermifugacaoRequest request,
            Equino equino
    ) {
        vermifugacao.setEquino(equino);
        vermifugacao.setVermifugo(request.vermifugo());
        vermifugacao.setQtdeMedicamento(request.qtdeMedicamento());
        vermifugacao.setUnidadeMedicamento(request.unidadeMedicamento());
        vermifugacao.setObservacao(request.observacao());
        vermifugacao.setDataProximoProcedimento(request.dataProximoProcedimento());
    }


    private VermifugacaoResponse toResponse(Vermifugacao vermifugacao) {
        return new VermifugacaoResponse(
                vermifugacao.getId(),
                vermifugacao.getEquino().getId(),
                vermifugacao.getEquino().getNome(),
                vermifugacao.getVermifugo(),
                vermifugacao.getQtdeMedicamento(),
                vermifugacao.getUnidadeMedicamento(),
                vermifugacao.getObservacao(),
                vermifugacao.getDataProximoProcedimento(),
                vermifugacao.getDataCadastro(),
                vermifugacao.getAtualizadoEm()
        );
    }
}

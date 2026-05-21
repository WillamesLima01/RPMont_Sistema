package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.VermifugacaoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.VermifugacaoResponse;
import br.com.rpmont.gerenciadorequinos.enums.OrigemMedicamentoEnum;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.Medicamento;
import br.com.rpmont.gerenciadorequinos.model.Vermifugacao;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.MedicamentoRepository;
import br.com.rpmont.gerenciadorequinos.repository.SaidaMedicamentoRepository;
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
    private final SaidaMedicamentoRepository saidaMedicamentoRepository;
    private final MedicamentoRepository medicamentoRepository;

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

        saidaMedicamentoRepository.deleteByVermifugacaoId(id);

        vermifugacaoRepository.delete(vermifugacaoExistente);
    }

    private void preencherDadosVermifugacao(
            Vermifugacao vermifugacao,
            VermifugacaoRequest request,
            Equino equino
    ) {
        Medicamento medicamento = null;

        if (request.origemMedicamento() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe a origem do medicamento: ESTOQUE ou EXTERNO."
            );
        }

        if (request.origemMedicamento() == OrigemMedicamentoEnum.ESTOQUE) {
            if (request.medicamentoId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Para medicamento do estoque, informe o medicamentoId."
                );
            }

            medicamento = medicamentoRepository.findById(request.medicamentoId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Medicamento não encontrado no banco de dados."
                    ));
        }

        if (request.origemMedicamento() == OrigemMedicamentoEnum.EXTERNO) {
            medicamento = null;
        }

        vermifugacao.setEquino(equino);
        vermifugacao.setMedicamento(medicamento);
        vermifugacao.setVermifugo(request.vermifugo());
        vermifugacao.setQtdeMedicamento(request.qtdeMedicamento());
        vermifugacao.setUnidadeMedicamento(request.unidadeMedicamento());
        vermifugacao.setOrigemMedicamento(request.origemMedicamento());
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
                vermifugacao.getOrigemMedicamento(),
                vermifugacao.getMedicamento() != null ? vermifugacao.getMedicamento().getId() : null,
                vermifugacao.getMedicamento() != null ? vermifugacao.getMedicamento().getNome() : null,
                vermifugacao.getObservacao(),
                vermifugacao.getDataProximoProcedimento(),
                vermifugacao.getDataCadastro(),
                vermifugacao.getAtualizadoEm()
        );
    }
}

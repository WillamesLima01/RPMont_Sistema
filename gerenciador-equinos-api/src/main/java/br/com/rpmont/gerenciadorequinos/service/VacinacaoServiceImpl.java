package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.VacinacaoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.VacinacaoResponse;
import br.com.rpmont.gerenciadorequinos.enums.OrigemMedicamentoEnum;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.Vacinacao;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.MedicamentoRepository;
import br.com.rpmont.gerenciadorequinos.repository.SaidaMedicamentoRepository;
import br.com.rpmont.gerenciadorequinos.repository.VacinacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import br.com.rpmont.gerenciadorequinos.model.Medicamento;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VacinacaoServiceImpl implements VacinacaoService {

    private final VacinacaoRepository vacinacaoRepository;
    private final EquinoRepository equinoRepository;
    private final SaidaMedicamentoRepository saidaMedicamentoRepository;
    private final MedicamentoRepository medicamentoRepository;

    @Transactional
    @Override
    public VacinacaoResponse criarVacinacao(VacinacaoRequest vacinacaoRequest) {
        Equino equinoExistente = equinoRepository.findById(vacinacaoRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."));

        Vacinacao criarVacinacao = new Vacinacao();

        preencherDadosVacinacao(criarVacinacao, vacinacaoRequest, equinoExistente);

        return  toResponse(vacinacaoRepository.save(criarVacinacao));
    }

    @Transactional(readOnly = true)
    @Override
    public List<VacinacaoResponse> listarTodasVacinacao() {
        return vacinacaoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public VacinacaoResponse buscaVacinacaoId(Long id) {
        Vacinacao vacinacaoExistente = vacinacaoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Vacinação não encontrada no banco de dados."));

        return toResponse(vacinacaoExistente);
    }

    @Transactional
    @Override
    public VacinacaoResponse atualizarVacinacaoId(Long id, VacinacaoRequest vacinacaoRequest) {

        Equino equinoExistente = equinoRepository.findById(vacinacaoRequest.equinoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados."));

        Vacinacao vacinacaoExistente = vacinacaoRepository.findById(id)
                        .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Vacinação não encontrada no banco de dados."));

       preencherDadosVacinacao(vacinacaoExistente, vacinacaoRequest, equinoExistente);

        return toResponse(vacinacaoRepository.save(vacinacaoExistente));
    }

    @Transactional
    @Override
    public void deletarVacinacaoId(Long id) {
        Vacinacao vacinacaoExistente = vacinacaoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Vacinação não encontrada no banco de dados."));

        saidaMedicamentoRepository.deleteByVacinacaoId(id);

        vacinacaoRepository.delete(vacinacaoExistente);
    }

    private void preencherDadosVacinacao(
            Vacinacao vacinacao,
            VacinacaoRequest request,
            Equino equino
    ) {
        Medicamento medicamento = null;

        if (request.origemMedicamento() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe a origem da vacina: ESTOQUE ou EXTERNO."
            );
        }

        if (request.origemMedicamento() == OrigemMedicamentoEnum.ESTOQUE) {
            if (request.medicamentoId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Para vacina do estoque, informe o medicamentoId."
                );
            }

            medicamento = medicamentoRepository.findById(request.medicamentoId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Medicamento não encontrado no banco de dados."
                    ));
        }

        vacinacao.setEquino(equino);
        vacinacao.setNomeVacina(request.nomeVacina());
        vacinacao.setQtdeMedicamento(request.qtdeMedicamento());
        vacinacao.setUnidadeMedicamento(request.unidadeMedicamento());
        vacinacao.setOrigemMedicamento(request.origemMedicamento());
        vacinacao.setMedicamento(medicamento);
        vacinacao.setObservacao(request.observacao());
        vacinacao.setDataProximoProcedimento(request.dataProximoProcedimento());
    }

    private VacinacaoResponse toResponse(Vacinacao vacinacao) {
        return new VacinacaoResponse(
                vacinacao.getId(),
                vacinacao.getEquino().getId(),
                vacinacao.getEquino().getNome(),
                vacinacao.getNomeVacina(),
                vacinacao.getQtdeMedicamento(),
                vacinacao.getUnidadeMedicamento(),
                vacinacao.getOrigemMedicamento(),
                vacinacao.getMedicamento() != null ? vacinacao.getMedicamento().getId() : null,
                vacinacao.getMedicamento() != null ? vacinacao.getMedicamento().getNome() : null,
                vacinacao.getObservacao(),
                vacinacao.getDataProximoProcedimento(),
                vacinacao.getDataCadastro(),
                vacinacao.getAtualizadoEm()
        );
    }
}

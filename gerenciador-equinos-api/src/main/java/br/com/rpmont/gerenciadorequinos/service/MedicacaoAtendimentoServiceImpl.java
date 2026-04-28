package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.MedicacaoAtendimentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.MedicacaoAtendimentoResponse;
import br.com.rpmont.gerenciadorequinos.enums.OrigemMedicamentoEnum;
import br.com.rpmont.gerenciadorequinos.model.Atendimentos;
import br.com.rpmont.gerenciadorequinos.model.Equino;
import br.com.rpmont.gerenciadorequinos.model.MedicacaoAtendimento;
import br.com.rpmont.gerenciadorequinos.model.Medicamento;
import br.com.rpmont.gerenciadorequinos.repository.AtendimentosRepository;
import br.com.rpmont.gerenciadorequinos.repository.EquinoRepository;
import br.com.rpmont.gerenciadorequinos.repository.MedicacaoAtendimentoRepository;
import br.com.rpmont.gerenciadorequinos.repository.MedicamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicacaoAtendimentoServiceImpl implements MedicacaoAtendimentoService {

    private final MedicacaoAtendimentoRepository medicacaoAtendimentoRepository;
    private final AtendimentosRepository atendimentosRepository;
    private final EquinoRepository equinoRepository;
    private final MedicamentoRepository medicamentoRepository;

    @Transactional
    @Override
    public MedicacaoAtendimentoResponse salvarMedicacaoAtendimento(MedicacaoAtendimentoRequest request) {

        Atendimentos atendimentoExistente = atendimentosRepository.findById(request.atendimentoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Atendimento não encontrado no banco de dados!"));

        Equino equinoExistente = equinoRepository.findById(request.equinoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"));

        MedicacaoAtendimento salvarMedicacao = new MedicacaoAtendimento();
        salvarMedicacao.setAtendimento(atendimentoExistente);
        salvarMedicacao.setEquino(equinoExistente);
        salvarMedicacao.setOrigem(request.origem());

        if (request.origem() == OrigemMedicamentoEnum.ESTOQUE) {
            if (request.medicamentoId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "O medicamento do estoque deve ser informado.");
            }

            Medicamento medicamentoExistente = medicamentoRepository.findById(request.medicamentoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Medicamento não encontrado no banco de dados!"));

            salvarMedicacao.setMedicamento(medicamentoExistente);
            salvarMedicacao.setNomeMedicamento(medicamentoExistente.getNome());
        } else {
            salvarMedicacao.setMedicamento(null);
            salvarMedicacao.setNomeMedicamento(request.nomeMedicamento());
        }

        salvarMedicacao.setDoseAplicada(request.doseAplicada());
        salvarMedicacao.setUnidade(request.unidade());
        salvarMedicacao.setObservacao(request.observacao());
        salvarMedicacao.setData(request.data());

        MedicacaoAtendimento medicacaoSalva = medicacaoAtendimentoRepository.save(salvarMedicacao);

        return toResponse(medicacaoSalva);
    }

    @Transactional(readOnly = true)
    @Override
    public MedicacaoAtendimentoResponse buscarMedicacaoAtendimentoId(Long id) {
        MedicacaoAtendimento medicacao = medicacaoAtendimentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Medicação do atendimento não encontrada no banco de dados!"));

        return toResponse(medicacao);
    }

    @Transactional(readOnly = true)
    @Override
    public List<MedicacaoAtendimentoResponse> listarTodasMedicacoesAtendimento() {
        return medicacaoAtendimentoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<MedicacaoAtendimentoResponse> buscarMedicacoesPorAtendimentoId(Long atendimentoId) {
        return medicacaoAtendimentoRepository.findByAtendimento_Id(atendimentoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<MedicacaoAtendimentoResponse> buscarMedicacoesPorEquinoId(Long equinoId) {
        return medicacaoAtendimentoRepository.findByEquino_Id(equinoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @Override
    public MedicacaoAtendimentoResponse atualizarMedicacaoAtendimentoId(Long id, MedicacaoAtendimentoRequest request) {

        MedicacaoAtendimento medicacaoExistente = medicacaoAtendimentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Medicação do atendimento não encontrada no banco de dados!"));

        Atendimentos atendimentoExistente = atendimentosRepository.findById(request.atendimentoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Atendimento não encontrado no banco de dados!"));

        Equino equinoExistente = equinoRepository.findById(request.equinoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equino não encontrado no banco de dados!"));

        medicacaoExistente.setAtendimento(atendimentoExistente);
        medicacaoExistente.setEquino(equinoExistente);
        medicacaoExistente.setOrigem(request.origem());

        if (request.origem() == OrigemMedicamentoEnum.ESTOQUE) {
            if (request.medicamentoId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "O medicamento do estoque deve ser informado.");
            }

            Medicamento medicamentoExistente = medicamentoRepository.findById(request.medicamentoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Medicamento não encontrado no banco de dados!"));

            medicacaoExistente.setMedicamento(medicamentoExistente);
            medicacaoExistente.setNomeMedicamento(medicamentoExistente.getNome());
        } else {
            medicacaoExistente.setMedicamento(null);
            medicacaoExistente.setNomeMedicamento(request.nomeMedicamento());
        }

        medicacaoExistente.setDoseAplicada(request.doseAplicada());
        medicacaoExistente.setUnidade(request.unidade());
        medicacaoExistente.setObservacao(request.observacao());
        medicacaoExistente.setData(request.data());

        MedicacaoAtendimento medicacaoAtualizada = medicacaoAtendimentoRepository.save(medicacaoExistente);

        return toResponse(medicacaoAtualizada);
    }

    @Transactional
    @Override
    public void deletarMedicacaoAtendimentoId(Long id) {
        MedicacaoAtendimento medicacaoExistente = medicacaoAtendimentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Medicação do atendimento não encontrada no banco de dados!"));

        medicacaoAtendimentoRepository.delete(medicacaoExistente);
    }

    private MedicacaoAtendimentoResponse toResponse(MedicacaoAtendimento medicacao) {
        return new MedicacaoAtendimentoResponse(
                medicacao.getId(),
                medicacao.getAtendimento().getId(),
                medicacao.getEquino().getId(),
                medicacao.getEquino().getNome(),
                medicacao.getOrigem(),
                medicacao.getMedicamento() != null ? medicacao.getMedicamento().getId() : null,
                medicacao.getNomeMedicamento(),
                medicacao.getDoseAplicada(),
                medicacao.getUnidade(),
                medicacao.getObservacao(),
                medicacao.getData(),
                medicacao.getDataCadastro(),
                medicacao.getAtualizadoEm()
        );
    }
}
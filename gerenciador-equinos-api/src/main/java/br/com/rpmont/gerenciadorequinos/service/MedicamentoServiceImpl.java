package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.MedicamentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.MedicamentoResponse;
import br.com.rpmont.gerenciadorequinos.model.Medicamento;
import br.com.rpmont.gerenciadorequinos.repository.MedicamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicamentoServiceImpl implements MedicamentoService {

    private final MedicamentoRepository medicamentoRepository;

    @Override
    public MedicamentoResponse salvarMedicamento(MedicamentoRequest medicamentoRequest) {

       if (medicamentoRepository.existsByNomeIgnoreCaseAndFormaAndTipoApresentacao(
               medicamentoRequest.nome(),
               medicamentoRequest.forma(),
               medicamentoRequest.tipoApresentacao())) {
           throw new ResponseStatusException(HttpStatus.CONFLICT,
                   "Medicamento já cadastrado");
       }

       Medicamento salvarMedicamento = new Medicamento();
       salvarMedicamento.setNome(medicamentoRequest.nome());
       salvarMedicamento.setNomeComercial(medicamentoRequest.nomeComercial());
       salvarMedicamento.setFabricante(medicamentoRequest.fabricante());
       salvarMedicamento.setCategoria(medicamentoRequest.categoria());
       salvarMedicamento.setForma(medicamentoRequest.forma());
       salvarMedicamento.setObservacao(medicamentoRequest.observacao());
       salvarMedicamento.setTipoApresentacao(medicamentoRequest.tipoApresentacao());
       salvarMedicamento.setQuantidadePorApresentacao(medicamentoRequest.quantidadePorApresentacao());
       salvarMedicamento.setUnidadeConteudo(medicamentoRequest.unidadeConteudo());
       salvarMedicamento.setUnidadeBase(medicamentoRequest.unidadeBase());
       salvarMedicamento.setTipoUnidadeEnum(medicamentoRequest.tipoUnidadeEnum());
       salvarMedicamento.setAtivo(medicamentoRequest.ativo());

       Medicamento medicamentoSalvo = medicamentoRepository.save(salvarMedicamento);

        return toResponse(medicamentoSalvo);
    }

    @Override
    public List<MedicamentoResponse> listarTodosMedicamentos() {
        return medicamentoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<MedicamentoResponse> listarTodosMedicamentosAtivos() {
        return medicamentoRepository.findByAtivoTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public MedicamentoResponse buscarMedicamentoId(Long id) {
        Medicamento medicamento = medicamentoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado no banco de dados."));

        return toResponse(medicamento);
    }

    @Override
    public MedicamentoResponse atualizarMedicamentoId(Long id, MedicamentoRequest medicamentoRequest) {
        Medicamento medicamentoExistente = medicamentoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "medicamento não encontrado no banco de dados."));

        medicamentoExistente.setNome(medicamentoRequest.nome());
        medicamentoExistente.setNomeComercial(medicamentoRequest.nomeComercial());
        medicamentoExistente.setFabricante(medicamentoRequest.fabricante());
        medicamentoExistente.setCategoria(medicamentoRequest.categoria());
        medicamentoExistente.setForma(medicamentoRequest.forma());
        medicamentoExistente.setObservacao(medicamentoRequest.observacao());
        medicamentoExistente.setTipoApresentacao(medicamentoRequest.tipoApresentacao());
        medicamentoExistente.setQuantidadePorApresentacao(medicamentoRequest.quantidadePorApresentacao());
        medicamentoExistente.setUnidadeConteudo(medicamentoRequest.unidadeConteudo());
        medicamentoExistente.setUnidadeBase(medicamentoRequest.unidadeBase());
        medicamentoExistente.setTipoUnidadeEnum(medicamentoRequest.tipoUnidadeEnum());
        medicamentoExistente.setAtivo(medicamentoRequest.ativo());

        Medicamento medicamentoAtualizado = medicamentoRepository.save(medicamentoExistente);

        return toResponse(medicamentoAtualizado);
    }

    @Override
    public void deletarMedicamentoId(Long id) {
        Medicamento medicamentoExistente = medicamentoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado no banco de dados."));

        medicamentoRepository.delete(medicamentoExistente);
    }

    private MedicamentoResponse toResponse(Medicamento medicamento) {
        return new MedicamentoResponse(
                medicamento.getId(),
                medicamento.getNome(),
                medicamento.getNomeComercial(),
                medicamento.getFabricante(),
                medicamento.getCategoria(),
                medicamento.getForma(),
                medicamento.getObservacao(),
                medicamento.getTipoApresentacao(),
                medicamento.getQuantidadePorApresentacao(),
                medicamento.getUnidadeConteudo(),
                medicamento.getUnidadeBase(),
                medicamento.getTipoUnidadeEnum(),
                medicamento.getAtivo(),
                medicamento.getDataCadastro(),
                medicamento.getAtualizadoEm()
        );
    }
}

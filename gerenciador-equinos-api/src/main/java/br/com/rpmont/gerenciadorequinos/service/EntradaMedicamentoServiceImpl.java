package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.EntradaMedicamentoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.EntradaMedicamentoResponse;
import br.com.rpmont.gerenciadorequinos.model.EntradaMedicamento;
import br.com.rpmont.gerenciadorequinos.model.Medicamento;
import br.com.rpmont.gerenciadorequinos.repository.EntradaMedicamentoRepository;
import br.com.rpmont.gerenciadorequinos.repository.MedicamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EntradaMedicamentoServiceImpl implements EntradaMedicamentoService {

    private final EntradaMedicamentoRepository entradaMedicamentoRepository;
    private final MedicamentoRepository medicamentoRepository;

    @Override
    public EntradaMedicamentoResponse salvarEntradaMedicamento(EntradaMedicamentoRequest entradaMedicamentoRequest) {
        Medicamento medicamentoExistente = medicamentoRepository.findById(entradaMedicamentoRequest.medicamentoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado no banco de dados."));

        EntradaMedicamento salvarEntrada = new EntradaMedicamento();

        salvarEntrada.setMedicamento(medicamentoExistente);
        salvarEntrada.setMedicamentoNome(medicamentoExistente.getNome());
        salvarEntrada.setFabricante(medicamentoExistente.getFabricante());
        salvarEntrada.setForma(medicamentoExistente.getForma());
        salvarEntrada.setTipoApresentacaoEnum(medicamentoExistente.getTipoApresentacao());
        salvarEntrada.setQuantidadePorApresentacao(medicamentoExistente.getQuantidadePorApresentacao());
        salvarEntrada.setUnidadeConteudo(medicamentoExistente.getUnidadeConteudo());
        salvarEntrada.setUnidadeBase(medicamentoExistente.getUnidadeBase());
        salvarEntrada.setTipoUnidade(medicamentoExistente.getTipoUnidadeEnum());

        salvarEntrada.setLote(entradaMedicamentoRequest.lote());
        salvarEntrada.setValidade(entradaMedicamentoRequest.validade());
        salvarEntrada.setQuantidadeApresentacoes(entradaMedicamentoRequest.quantidadeApresentacoes());
        salvarEntrada.setDataEntrada(entradaMedicamentoRequest.dataEntrada());
        salvarEntrada.setFornecedor(entradaMedicamentoRequest.fornecedor());
        salvarEntrada.setValorUnitario(entradaMedicamentoRequest.valorUnitario());
        salvarEntrada.setObservacao(entradaMedicamentoRequest.observacao());

        salvarEntrada.setQuantidadeBase(
                medicamentoExistente.getQuantidadePorApresentacao()
                        .multiply(java.math.BigDecimal.valueOf(entradaMedicamentoRequest.quantidadeApresentacoes()))
        );

        salvarEntrada.setValorTotal(
                entradaMedicamentoRequest.valorUnitario()
                        .multiply(java.math.BigDecimal.valueOf(entradaMedicamentoRequest.quantidadeApresentacoes()))
        );

        EntradaMedicamento entradaSalva = entradaMedicamentoRepository.save(salvarEntrada);

        return toResponse(entradaSalva);
    }

    @Override
    public EntradaMedicamentoResponse buscarEntradaMedicamentoId(Long id) {
        return null;
    }

    @Override
    public List<EntradaMedicamentoResponse> ListarTodasEntradaMedicamento() {
        return List.of();
    }

    @Override
    public List<EntradaMedicamentoResponse> buscarEntradaPorMedicamentoId(Long medicamentoId) {
        return List.of();
    }

    @Override
    public EntradaMedicamentoResponse atualizarEntradaMedicamentoId(Long id, EntradaMedicamentoRequest entradaMedicamentoRequest) {
        return null;
    }

    @Override
    public void deletarEntradaMedicamentoId(Long id) {

    }

    private EntradaMedicamentoResponse toResponse(EntradaMedicamento entradaMedicamento) {
        return new EntradaMedicamentoResponse(
                entradaMedicamento.getId(),
                entradaMedicamento.getMedicamento().getId(),
                entradaMedicamento.getMedicamento().getNome(),
                entradaMedicamento.getFabricante(),
                entradaMedicamento.getForma(),
                entradaMedicamento.getTipoApresentacaoEnum(),
                entradaMedicamento.getQuantidadePorApresentacao(),
                entradaMedicamento.getUnidadeConteudo(),
                entradaMedicamento.getUnidadeBase(),
                entradaMedicamento.getTipoUnidade(),
                entradaMedicamento.getLote(),
                entradaMedicamento.getValidade(),
                entradaMedicamento.getQuantidadeApresentacoes(),
                entradaMedicamento.getQuantidadeBase(),
                entradaMedicamento.getDataEntrada(),
                entradaMedicamento.getFornecedor(),
                entradaMedicamento.getValorUnitario(),
                entradaMedicamento.getValorTotal(),
                entradaMedicamento.getObservacao(),
                entradaMedicamento.getDataCadastro(),
                entradaMedicamento.getAtualizadoEm()
        );
    }
}

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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EntradaMedicamentoServiceImpl implements EntradaMedicamentoService {

    private final EntradaMedicamentoRepository entradaMedicamentoRepository;
    private final MedicamentoRepository medicamentoRepository;

    @Transactional
    @Override
    public EntradaMedicamentoResponse salvarEntradaMedicamento(EntradaMedicamentoRequest entradaMedicamentoRequest) {
        Medicamento medicamentoExistente = medicamentoRepository.findById(entradaMedicamentoRequest.medicamentoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado no banco de dados."));

        EntradaMedicamento salvarEntrada = new EntradaMedicamento();

        preencherDadosEntrada(salvarEntrada, entradaMedicamentoRequest, medicamentoExistente);

        EntradaMedicamento entradaSalva = entradaMedicamentoRepository.save(salvarEntrada);

        return toResponse(entradaSalva);
    }

    @Transactional(readOnly = true)
    @Override
    public EntradaMedicamentoResponse buscarEntradaMedicamentoId(Long id) {
        EntradaMedicamento entradaMedicamentoExistente = entradaMedicamentoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado no banco de dados."));

        return toResponse(entradaMedicamentoExistente);
    }

    @Transactional(readOnly = true)
    @Override
    public List<EntradaMedicamentoResponse> ListarTodasEntradasMedicamento() {
        return entradaMedicamentoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<EntradaMedicamentoResponse> buscarEntradaPorMedicamentoId(Long medicamentoId) {
        return entradaMedicamentoRepository.findByMedicamentoId(medicamentoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @Override
    public EntradaMedicamentoResponse atualizarEntradaMedicamentoId(Long id, EntradaMedicamentoRequest entradaMedicamentoRequest) {

        Medicamento medicamentoExistente = medicamentoRepository.findById(entradaMedicamentoRequest.medicamentoId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado no banco de dados."));

        EntradaMedicamento entradaMedicamentoExistente = entradaMedicamentoRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Entrada de medicamento não encontrada no banco de dados."));

        preencherDadosEntrada(entradaMedicamentoExistente, entradaMedicamentoRequest, medicamentoExistente);

        EntradaMedicamento entradaAtualizada = entradaMedicamentoRepository.save(entradaMedicamentoExistente);

        return toResponse(entradaAtualizada);
    }

    @Transactional
    @Override
    public void deletarEntradaMedicamentoId(Long id) {
            EntradaMedicamento entradaMedicamentoExistente = entradaMedicamentoRepository.findById(id)
                    .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Entrada de medicamento não encontrada no banco de dados."));

            entradaMedicamentoRepository.delete(entradaMedicamentoExistente);
    }

    private void preencherDadosEntrada(EntradaMedicamento entradaMedicamento,
                                       EntradaMedicamentoRequest entradaMedicamentoRequest,
                                       Medicamento medicamento) {

        BigDecimal quantidadeBase = medicamento.getQuantidadePorApresentacao()
                .multiply(entradaMedicamentoRequest.quantidadeApresentacoes());

        BigDecimal valorTotal = entradaMedicamentoRequest.valorUnitario()
                .multiply(entradaMedicamentoRequest.quantidadeApresentacoes());

        entradaMedicamento.setMedicamento(medicamento);
        entradaMedicamento.setMedicamentoNome(medicamento.getNome());
        entradaMedicamento.setFabricante(medicamento.getFabricante());
        entradaMedicamento.setForma(medicamento.getForma());
        entradaMedicamento.setTipoApresentacaoEnum(medicamento.getTipoApresentacao());
        entradaMedicamento.setQuantidadePorApresentacao(medicamento.getQuantidadePorApresentacao());
        entradaMedicamento.setUnidadeConteudo(medicamento.getUnidadeConteudo());
        entradaMedicamento.setUnidadeBase(medicamento.getUnidadeBase());
        entradaMedicamento.setTipoUnidade(medicamento.getTipoUnidadeEnum());

        entradaMedicamento.setLote(entradaMedicamentoRequest.lote());
        entradaMedicamento.setValidade(entradaMedicamentoRequest.validade());
        entradaMedicamento.setQuantidadeApresentacoes(entradaMedicamentoRequest.quantidadeApresentacoes());
        entradaMedicamento.setQuantidadeBase(quantidadeBase);
        entradaMedicamento.setDataEntrada(entradaMedicamentoRequest.dataEntrada());
        entradaMedicamento.setFornecedor(entradaMedicamentoRequest.fornecedor());
        entradaMedicamento.setValorUnitario(entradaMedicamentoRequest.valorUnitario());
        entradaMedicamento.setValorTotal(valorTotal);
        entradaMedicamento.setObservacao(entradaMedicamentoRequest.observacao());
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

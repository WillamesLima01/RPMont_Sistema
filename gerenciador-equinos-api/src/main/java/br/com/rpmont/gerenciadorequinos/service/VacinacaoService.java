package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.VacinacaoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.VacinacaoResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface VacinacaoService {

    VacinacaoResponse criarVacinacao(VacinacaoRequest vacinacaoRequest);
    List<VacinacaoResponse> listarTodasVacinacao();
    VacinacaoResponse buscaVacinacaoId(Long id);
    VacinacaoResponse atualizarVacinacaoId(Long id, VacinacaoRequest vacinacaoRequest);
    void deletarVacinacaoId(Long id);
}

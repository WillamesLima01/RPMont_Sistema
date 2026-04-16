package br.com.rpmont.gerenciadorequinos.service;

import br.com.rpmont.gerenciadorequinos.dtos.VermifugacaoRequest;
import br.com.rpmont.gerenciadorequinos.dtos.VermifugacaoResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface VermifugacaoService {

    VermifugacaoResponse criarVermifugacao(VermifugacaoRequest vermifugacaoRequest);
    List<VermifugacaoResponse> listarTodasVermifugacao();
    VermifugacaoResponse buscaVermifugacaoId(Long id);
    VermifugacaoResponse atualizarVermifugacaoId(Long id, VermifugacaoRequest vermifugacaoRequest);
    void deletarVermifugacaoId(Long id);
}

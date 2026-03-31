// src/pages/veterinaria/VeterinariaEquinosAptosComRestricao.jsx
import React, { useEffect, useState } from 'react';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import BotaoAcao from '../../components/botoes/BotaoAcaoRows.jsx';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import Modal from 'react-modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Modal.setAppElement('#root');

const SITUACOES = {
  APTO: 'APTO',
  APTO_COM_RESTRICAO: 'APTO_COM_RESTRICAO',
  BAIXADO: 'BAIXADO',
};

const formatarSituacao = (situacao) => {
  switch (situacao) {
    case SITUACOES.APTO:
      return 'Apto';
    case SITUACOES.APTO_COM_RESTRICAO:
      return 'Apto com restrição';
    case SITUACOES.BAIXADO:
      return 'Baixado';
    default:
      return situacao || '';
  }
};

const VeterinariaEquinosAptosComRestricao = () => {
  const [equinos, setEquinos] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [botoes, setBotoes] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [retornandoId, setRetornandoId] = useState(null);

  useEffect(() => {
    carregarEquinos();
    setBotoes(['atendimento', 'retorno']);
  }, []);

  const carregarEquinos = async () => {
    try {
      const resEquinos = await axios.get('/equino');

      const todosEquinos = Array.isArray(resEquinos.data) ? resEquinos.data : [];

      const aptosComRestricao = todosEquinos.filter(
        (eq) => eq.situacao === SITUACOES.APTO_COM_RESTRICAO
      );

      setEquinos(aptosComRestricao);
      setResultado(aptosComRestricao);
    } catch (error) {
      console.error('Erro ao carregar equinos com restrição:', error);
    }
  };

  const filtrar = () => {
    let lista = (equinos || []).filter(
      (eq) => eq.situacao === SITUACOES.APTO_COM_RESTRICAO
    );

    if (filtroNome) {
      const termo = filtroNome.toLowerCase().trim();
      lista = lista.filter(
        (eq) =>
          String(eq.id).includes(termo) ||
          (eq.nome || '').toLowerCase().includes(termo) ||
          (eq.registro || '').toLowerCase().includes(termo)
      );
    }

    if (filtroInicio) {
      lista = lista.filter((eq) => {
        if (!eq.dataCadastro) return false;
        return eq.dataCadastro.slice(0, 10) >= filtroInicio;
      });
    }

    if (filtroFim) {
      lista = lista.filter((eq) => {
        if (!eq.dataCadastro) return false;
        return eq.dataCadastro.slice(0, 10) <= filtroFim;
      });
    }

    setResultado(lista);
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');
    setResultado(equinos);
  };

  const exportarCSV = () => {
    const linhas = ['Nome,Raça,Pelagem,Registro,Data de Cadastro,Situação'];

    resultado.forEach((eq) => {
      linhas.push(
        [
          eq.nome || '',
          eq.raca || '',
          eq.pelagem || '',
          eq.registro || '',
          eq.dataCadastro ? eq.dataCadastro.slice(0, 10) : '',
          formatarSituacao(eq.situacao),
        ].join(',')
      );
    });

    const blob = new Blob([linhas.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'equinos_aptos_com_restricao.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const gerarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const margem = 40;

    doc.setFontSize(16);
    doc.text('Lista de Equinos Aptos com Restrição', margem, 30);
    doc.setFontSize(10);

    const info = [];
    if (filtroNome) info.push(`Filtro: ${filtroNome}`);
    if (filtroInicio) info.push(`Início: ${filtroInicio}`);
    if (filtroFim) info.push(`Fim: ${filtroFim}`);
    info.push(`Total: ${resultado.length}`);

    let y = 48;
    info.forEach((t) => {
      doc.text(t, margem, y);
      y += 16;
    });

    const dadosTabela = (resultado || []).map((eq) => {
      const dataCadastroFmt = eq.dataCadastro
        ? new Date(eq.dataCadastro).toLocaleDateString('pt-BR')
        : '—';

      return [
        eq.nome || '',
        eq.raca || '',
        eq.pelagem || '',
        eq.registro || '',
        dataCadastroFmt,
        formatarSituacao(eq.situacao),
      ];
    });

    autoTable(doc, {
      head: [['Nome', 'Raça', 'Pelagem', 'Registro', 'Data de Cadastro', 'Situação']],
      body: dadosTabela,
      startY: y + 8,
      styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak' },
      headStyles: { fillColor: [33, 150, 243] },
      margin: { left: margem, right: margem },
      columnStyles: {
        0: { cellWidth: 150 },
        1: { cellWidth: 100 },
        2: { cellWidth: 110 },
        3: { cellWidth: 120 },
        4: { cellWidth: 110 },
        5: { cellWidth: 130 },
      },
      didDrawPage: (data) => {
        const pages = doc.internal.getNumberOfPages();
        const w = doc.internal.pageSize.getWidth();
        const h = doc.internal.pageSize.getHeight();
        const str = `Página ${data.pageNumber} de ${pages}`;
        doc.setFontSize(9);
        doc.text(str, w - margem, h - 10, { align: 'right' });
      },
    });

    doc.save('equinos_aptos_com_restricao.pdf');
  };

  const handleRetornoApto = async (equino) => {
    if (retornandoId) return;

    try {
      setRetornandoId(equino.id);

      await axios.patch(`/equino/${equino.id}`, {
        situacao: SITUACOES.APTO,
      });

      setModalAberto(true);

      setTimeout(() => {
        setModalAberto(false);
        carregarEquinos();
      }, 1500);
    } catch (error) {
      console.error('Erro ao retornar equino para APTO:', error);
      alert('Falha ao atualizar a situação do equino.');
    } finally {
      setRetornandoId(null);
    }
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <CabecalhoEquinos
        titulo="Equinos Aptos com Restrição"
        equinos={equinos}
        filtroNome={filtroNome}
        setFiltroNome={setFiltroNome}
        filtroInicio={filtroInicio}
        setFiltroInicio={setFiltroInicio}
        filtroFim={filtroFim}
        setFiltroFim={setFiltroFim}
        onFiltrar={filtrar}
        limparFiltros={limparFiltros}
        gerarPDF={gerarPDF}
        exportarCSV={exportarCSV}
        mostrarDatas={true}
        mostrarBotoesPDF={true}
        resultado={resultado}
      />

      <table className="table table-hover">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Raça</th>
            <th>Pelagem</th>
            <th>Altura</th>
            <th>Peso</th>
            <th>Registro</th>
            <th>Data Cadastro</th>
            <th>Status</th>
            <th className="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          {resultado.map((eq) => {
            const dataCadastroFormatada = eq.dataCadastro
              ? new Date(eq.dataCadastro).toLocaleDateString('pt-BR')
              : '—';

            return (
              <tr key={eq.id}>
                <td>{eq.nome}</td>
                <td>{eq.raca}</td>
                <td>{eq.pelagem}</td>
                <td>{eq.altura}</td>
                <td>{eq.peso}</td>
                <td>{eq.registro}</td>
                <td>{dataCadastroFormatada}</td>
                <td>{formatarSituacao(eq.situacao)}</td>
                <td className="text-end">
                  {botoes.includes('atendimento') && (
                    <BotaoAcao
                      to={`/atendimento-equino/${eq.id}`}
                      title="Atendimento"
                      className="botao-atendimento"
                      icone="bi-clipboard2-pulse"
                    />
                  )}

                  {botoes.includes('retorno') && (
                    <BotaoAcao
                      tipo="button"
                      onClick={() => handleRetornoApto(eq)}
                      title={retornandoId === eq.id ? 'Processando...' : 'Retornar para apto'}
                      className="botao-retorno"
                      icone="bi-arrow-up-circle"
                      disabled={retornandoId === eq.id}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Modal
        isOpen={modalAberto}
        onRequestClose={() => setModalAberto(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modalContent text-center">
          <h4 className="text-success">✅ Situação do equino atualizada com sucesso!</h4>
        </div>
      </Modal>
    </div>
  );
};

export default VeterinariaEquinosAptosComRestricao;
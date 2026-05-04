// src/pages/veterinaria/VeterinariaEquinosBaixadosList.jsx
import React, { useEffect, useState } from 'react';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import BotaoAcao from '../../components/botoes/BotaoAcaoRows.jsx';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import Modal from 'react-modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Modal.setAppElement('#root');

const SITUACAO = {
  APTO: 'APTO',
  APTO_COM_RESTRICAO: 'APTO_COM_RESTRICAO',
  BAIXADO: 'BAIXADO',
};

const formatarSituacao = (situacao) => {
  switch (situacao) {
    case SITUACAO.APTO:
      return 'Apto';
    case SITUACAO.APTO_COM_RESTRICAO:
      return 'Apto com restrição';
    case SITUACAO.BAIXADO:
      return 'Baixado';
    default:
      return situacao || '';
  }
};

const VeterinariaEquinosBaixadosList = () => {
  const [equinos, setEquinos] = useState([]);
  const [equinosBaixados, setEquinosBaixados] = useState([]);
  const [botoes, setBotoes] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [resultado, setResultado] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [retornandoId, setRetornandoId] = useState(null);

  useEffect(() => {
    carregarEquinos();
    setBotoes(['atendimento', 'retorno']);
  }, []);

  const carregarEquinos = async () => {
    try {
      const [resEquinos, resBaixados] = await Promise.all([
        axios.get('/equino'),
        axios.get('/equino/baixados'),
      ]);
  
      const todosEquinos = Array.isArray(resEquinos.data) ? resEquinos.data : [];
      const todosBaixados = Array.isArray(resBaixados.data) ? resBaixados.data : [];
  
      const baixadosAtivos = todosEquinos.filter(
        (eq) => String(eq.situacao || '').toUpperCase() === 'BAIXADO'
      );
  
      setEquinos(baixadosAtivos);
      setEquinosBaixados(todosBaixados);
  
      const mapaBaixaAtiva = new Map(
        todosBaixados
          .filter((b) => {
            const equinoId = b?.equino_id ?? b?.equinoId ?? b?.equino?.id;
            const dataBaixa = b?.data_baixa ?? b?.dataBaixa;
            const dataRetorno = b?.data_retorno ?? b?.dataRetorno;
  
            return equinoId && dataBaixa && !dataRetorno;
          })
          .map((b) => {
            const equinoId = b?.equino_id ?? b?.equinoId ?? b?.equino?.id;
            const dataBaixa = b?.data_baixa ?? b?.dataBaixa;
            return [String(equinoId), dataBaixa];
          })
      );
  
      const resultadoInicial = baixadosAtivos
        .filter((eq) => mapaBaixaAtiva.has(String(eq.id)))
        .map((eq) => ({
          ...eq,
          data_baixa: mapaBaixaAtiva.get(String(eq.id)),
        }));
  
      setResultado(resultadoInicial);
    } catch (error) {
      console.error('Erro ao carregar equinos:', error);
    }
  };

  const filtrar = () => {
    const baixasAtivasMap = new Map(
      (equinosBaixados || [])
        .filter((b) => {
          const equinoId = b?.equino_id ?? b?.equinoId ?? b?.equino?.id;
          const dataBaixa = b?.data_baixa ?? b?.dataBaixa;
          const dataRetorno = b?.data_retorno ?? b?.dataRetorno;
  
          return equinoId && dataBaixa && !dataRetorno;
        })
        .map((b) => {
          const equinoId = b?.equino_id ?? b?.equinoId ?? b?.equino?.id;
          const dataBaixa = b?.data_baixa ?? b?.dataBaixa;
          return [String(equinoId), dataBaixa];
        })
    );
  
    let lista = (equinos || [])
      .filter(
        (eq) =>
          String(eq.situacao || '').toUpperCase() === 'BAIXADO' &&
          baixasAtivasMap.has(String(eq.id))
      )
      .map((eq) => ({
        ...eq,
        data_baixa: baixasAtivasMap.get(String(eq.id)),
      }));
  
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
      lista = lista.filter((eq) => eq.data_baixa >= filtroInicio);
    }
  
    if (filtroFim) {
      lista = lista.filter((eq) => eq.data_baixa <= filtroFim);
    }
  
    setResultado(lista);
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');
  
    const baixasAtivasMap = new Map(
      (equinosBaixados || [])
        .filter((b) => {
          const equinoId = b?.equino_id ?? b?.equinoId ?? b?.equino?.id;
          const dataBaixa = b?.data_baixa ?? b?.dataBaixa;
          const dataRetorno = b?.data_retorno ?? b?.dataRetorno;
  
          return equinoId && dataBaixa && !dataRetorno;
        })
        .map((b) => {
          const equinoId = b?.equino_id ?? b?.equinoId ?? b?.equino?.id;
          const dataBaixa = b?.data_baixa ?? b?.dataBaixa;
          return [String(equinoId), dataBaixa];
        })
    );
  
    const inicial = (equinos || [])
      .filter(
        (eq) =>
          String(eq.situacao || '').toUpperCase() === 'BAIXADO' &&
          baixasAtivasMap.has(String(eq.id))
      )
      .map((eq) => ({
        ...eq,
        data_baixa: baixasAtivasMap.get(String(eq.id)),
      }));
  
    setResultado(inicial);
  };

  const exportarCSV = () => {
    const linhas = ['Nome,Raça,Pelagem,Registro,Data da Baixa,Situação'];

    resultado.forEach((eq) => {
      linhas.push(
        [
          eq.nome || '',
          eq.raca || '',
          eq.pelagem || '',
          eq.registro || '',
          eq.data_baixa || '',
          formatarSituacao(eq.situacao),
        ].join(',')
      );
    });

    const blob = new Blob([linhas.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'equinos_baixados.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const gerarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const margem = 40;

    doc.setFontSize(16);
    doc.text('Lista de Equinos Baixados', margem, 30);
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
      const data_baixaFmt = eq.data_baixa
        ? new Date(eq.data_baixa + 'T00:00:00').toLocaleDateString('pt-BR')
        : '—';

      return [
        eq.nome || '',
        eq.raca || '',
        eq.pelagem || '',
        eq.registro || '',
        data_baixaFmt,
        formatarSituacao(eq.situacao),
      ];
    });

    autoTable(doc, {
      head: [['Nome', 'Raça', 'Pelagem', 'Registro', 'Data da Baixa', 'Situação']],
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
        5: { cellWidth: 110 },
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

    doc.save('equinos_baixados.pdf');
  };

  const handleRetorno = async (equino) => {
    if (retornandoId) return;
  
    const equinoId = equino?.equinoId ?? equino?.equino_id ?? equino?.equino?.id ?? equino?.id;
  
    if (!equinoId) {
      alert('ID do equino não encontrado.');
      return;
    }
  
    try {
      setRetornandoId(equinoId);
  
      await axios.post(`/equino/${equinoId}/retornar`);
  
      setModalAberto(true);
  
      setTimeout(() => {
        setModalAberto(false);
        carregarEquinos();
      }, 1500);
    } catch (error) {
      console.error('Erro ao retornar equino:', error);
      alert('Falha ao retornar o equino.');
    } finally {
      setRetornandoId(null);
    }
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <CabecalhoEquinos
        titulo="Equinos Baixados"
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
            <th>Data da Baixa</th>
            <th>Status</th>
            <th className="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          {resultado.map((eq) => {
            const dataBaixaFormatada = eq.data_baixa
              ? new Date(eq.data_baixa + 'T00:00:00').toLocaleDateString('pt-BR')
              : '—';

            return (
              <tr key={eq.id}>
                <td>{eq.nome}</td>
                <td>{eq.raca}</td>
                <td>{eq.pelagem}</td>
                <td>{eq.altura}</td>
                <td>{eq.peso}</td>
                <td>{eq.registro}</td>
                <td>{dataBaixaFormatada}</td>
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
                      onClick={() => handleRetorno(eq)}
                      title={retornandoId === (eq.equinoId ?? eq.equino_id ?? eq.id) ? 'Processando...' : 'Retornar às atividades'}
                      className="botao-retorno"
                      icone="bi-arrow-up-circle"
                      disabled={retornandoId === (eq.equinoId ?? eq.equino_id ?? eq.id)}
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
          <h4 className="text-success">✅ Equino retornado com sucesso!</h4>
        </div>
      </Modal>
    </div>
  );
};

export default VeterinariaEquinosBaixadosList;
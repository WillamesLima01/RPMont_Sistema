// src/pages/veterinaria/VeterinariaEquinosBaixadosList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import BotaoAcao from '../../components/botoes/BotaoAcaoRows.jsx';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import Modal from 'react-modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Modal.setAppElement('#root');

const VeterinariaEquinosBaixadosList = () => {
  const [equinos, setEquinos] = useState([]);
  const [equinosBaixados, setEquinosBaixados] = useState([]);
  const [botoes, setBotoes] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [resultado, setResultado] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    carregarEquinos();
    setBotoes(['atendimento', 'retorno']);
  }, []);

  const carregarEquinos = async () => {
    try {
      const [resEquinos, resBaixados] = await Promise.all([
        axios.get('/equinos'),
        axios.get('/equinosBaixados'),
      ]);

      const baixadosAtivos = resEquinos.data.filter(eq => eq.status === 'Baixado');
      setEquinos(baixadosAtivos);
      setEquinosBaixados(resBaixados.data);

      // estado inicial: apenas baixas ativas com dataBaixa anexada
      const mapaBaixaAtiva = new Map(
        resBaixados.data
          .filter(b => b && b.idEquino && !b.dataRetorno && b.dataBaixa)
          .map(b => [String(b.idEquino), b.dataBaixa])
      );

      const resultadoInicial = baixadosAtivos
        .filter(eq => mapaBaixaAtiva.has(String(eq.id)))
        .map(eq => ({ ...eq, dataBaixa: mapaBaixaAtiva.get(String(eq.id)) }));

      setResultado(resultadoInicial);
    } catch (error) {
      console.error('Erro ao carregar equinos:', error);
    }
  };

  // === FILTRO com data da baixa ativa (string YYYY-MM-DD) ===
  const filtrar = () => {
    // Mapa { idEquino -> dataBaixa } somente de baixas ativas
    const baixasAtivasMap = new Map(
      (equinosBaixados || [])
        .filter(b => b && b.idEquino && !b.dataRetorno && b.dataBaixa)
        .map(b => [String(b.idEquino), b.dataBaixa])
    );

    // base: equinos Baixados que têm baixa ativa
    let lista = (equinos || [])
      .filter(eq => eq.status === 'Baixado' && baixasAtivasMap.has(String(eq.id)))
      .map(eq => ({ ...eq, dataBaixa: baixasAtivasMap.get(String(eq.id)) })); // YYYY-MM-DD

    // filtro por equino (id)
    if (filtroNome) {
      lista = lista.filter(eq => String(eq.id) === String(filtroNome));
    }

    // filtro por datas (comparação de string YYYY-MM-DD é segura)
    if (filtroInicio) {
      lista = lista.filter(eq => eq.dataBaixa >= filtroInicio);
    }
    if (filtroFim) {
      lista = lista.filter(eq => eq.dataBaixa <= filtroFim);
    }

    setResultado(lista);
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');

    // Recompõe estado inicial (baixas ativas) com dataBaixa
    const baixasAtivasMap = new Map(
      (equinosBaixados || [])
        .filter(b => b && b.idEquino && !b.dataRetorno && b.dataBaixa)
        .map(b => [String(b.idEquino), b.dataBaixa])
    );

    const inicial = (equinos || [])
      .filter(eq => eq.status === 'Baixado' && baixasAtivasMap.has(String(eq.id)))
      .map(eq => ({ ...eq, dataBaixa: baixasAtivasMap.get(String(eq.id)) }));

    setResultado(inicial);
  };

  const exportarCSV = () => {
    const linhas = ['Nome,Raça,Pelagem,Registro,Status'];
    resultado.forEach(eq => {
      linhas.push(`${eq.name},${eq.raca},${eq.pelagem},${eq.numeroRegistro},${eq.status}`);
    });

    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
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
    if (filtroNome) {
      const eqSel = equinos.find(e => e.id === filtroNome);
      info.push(`Equino: ${eqSel?.name ?? filtroNome}`);
    }
    if (filtroInicio) info.push(`Início: ${filtroInicio}`);
    if (filtroFim) info.push(`Fim: ${filtroFim}`);
    info.push(`Total: ${resultado.length}`);

    let y = 48;
    info.forEach(t => { doc.text(t, margem, y); y += 16; });

    const dadosTabela = (resultado || []).map(eq => {
      const dataBaixaFmt = eq.dataBaixa
        ? new Date(eq.dataBaixa + 'T00:00:00').toLocaleDateString('pt-BR')
        : '—';
      return [eq.name, eq.raca, eq.pelagem, eq.numeroRegistro, dataBaixaFmt, eq.status];
    });

    autoTable(doc, {
      head: [['Nome', 'Raça', 'Pelagem', 'Registro', 'Data da Baixa', 'Status']],
      body: dadosTabela,
      startY: y + 8,
      styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak' },
      headStyles: { fillColor: [33, 150, 243] },
      margin: { left: margem, right: margem },
      columnStyles: {
        0: { cellWidth: 150 }, // Nome
        1: { cellWidth: 100 }, // Raça
        2: { cellWidth: 110 }, // Pelagem
        3: { cellWidth: 120 }, // Registro
        4: { cellWidth: 110 }, // Data da Baixa
        5: { cellWidth: 90 },  // Status
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

  const [retornandoId, setRetornandoId] = useState(null);
  const handleRetorno = async (equino) => {
    if (retornandoId) return;
    const registroBaixa = equinosBaixados.find(b => b.idEquino === equino.id && !b.dataRetorno);
    if (!registroBaixa) return alert('Registro de baixa não encontrado.');

    try {
      setRetornandoId(equino.id);
      await axios.patch(`/equinos/${equino.id}`, { status: 'Ativo' });
      await axios.patch(`/equinosBaixados/${registroBaixa.id}`, {
        dataRetorno: new Date().toISOString().slice(0, 10),
      });

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
            <th>Registro</th>
            <th>Data da Baixa</th>
            <th>Status</th>
            <th className="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          {resultado.map(eq => {
            const dataBaixaFormatada = eq.dataBaixa
              ? new Date(eq.dataBaixa + 'T00:00:00').toLocaleDateString('pt-BR')
              : '—';

            return (
              <tr key={eq.id}>
                <td>{eq.name}</td>
                <td>{eq.raca}</td>
                <td>{eq.pelagem}</td>
                <td>{eq.numeroRegistro}</td>
                <td>{dataBaixaFormatada}</td>
                <td>{eq.status}</td>
                <td className="text-end">
                  {botoes.includes('atendimento') && (
                    <BotaoAcao
                      to={`/atendimento/${eq.id}`}
                      title="Atendimento"
                      className="botao-atendimento"
                      icone="bi-clipboard2-pulse"
                    />
                  )}
                  {botoes.includes('retorno') && (
                    <BotaoAcao
                      tipo="button"
                      onClick={() => handleRetorno(eq)}
                      title={retornandoId === eq.id ? 'Processando...' : 'Retornar às atividades'}
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
          <h4 className="text-success">✅ Equino retornado com sucesso!</h4>
        </div>
      </Modal>
    </div>
  );
};

export default VeterinariaEquinosBaixadosList;

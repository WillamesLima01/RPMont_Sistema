// src/pages/veterinaria/VeterinariaAtendimentoList.jsx
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar.jsx';
import Modal from 'react-modal';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Veterinaria.css';
import axios from '../../api';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import BotaoAcaoRows from '../../components/botoes/BotaoAcaoRows.jsx';

// PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Modal.setAppElement('#root');

const VeterinariaAtendimentoList = () => {
  const [equinos, setEquinos] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [botoes, setBotoes] = useState([]);
  const itemsPerPage = 15;

  useEffect(() => {
    axios.get('/equinos').then(res => setEquinos(res.data));
    axios.get('/atendimentos').then(res => {
      setAtendimentos(res.data);
      setResultado(res.data);
    });
    setBotoes(['editar', 'excluir']);
  }, []);

  const filtrar = () => {
    let filtrados = atendimentos;

    if (filtroNome) {
      filtrados = filtrados.filter(a => a.idEquino === filtroNome);
    }
    if (filtroInicio) {
      filtrados = filtrados.filter(a => a.data >= filtroInicio); // ISO YYYY-MM-DD
    }
    if (filtroFim) {
      filtrados = filtrados.filter(a => a.data <= filtroFim);
    }

    setResultado(filtrados);
    setCurrentPage(1);
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');
    setResultado(atendimentos);
    setCurrentPage(1);
  };

  // === GERAR PDF (usado pelo botão do cabeçalho) ===
  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const margem = 40;

    // Cabeçalho
    doc.setFontSize(16);
    doc.text('Relatório de Atendimentos', margem, 30);
    doc.setFontSize(10);

    const linhasInfo = [];
    if (filtroNome) {
      const eq = equinos.find(e => e.id === filtroNome);
      linhasInfo.push(`Equino: ${eq?.name ?? filtroNome}`);
    }
    if (filtroInicio) linhasInfo.push(`Início: ${filtroInicio}`);
    if (filtroFim) linhasInfo.push(`Fim: ${filtroFim}`);
    linhasInfo.push(`Total: ${resultado.length}`);

    let y = 48;
    linhasInfo.forEach(t => { doc.text(t, margem, y); y += 16; });

    // Tabela
    const head = [['#', 'Nome do Equino', 'Raça', 'Registro', 'Data', 'Consulta']];
    const body = resultado.map((a, i) => {
      const equino = equinos.find(eq => eq.id === a.idEquino);
      return [
        i + 1,
        equino?.name || '-',
        equino?.raca || '-',
        equino?.numeroRegistro || '-',
        a.data || '-',
        a.textoConsulta || '-',
      ];
    });

    autoTable(doc, {
      head,
      body,
      startY: y + 8,
      styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak' },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: margem, right: margem },
      columnStyles: {
        0: { cellWidth: 40 },   // #
        1: { cellWidth: 130 },  // Nome
        2: { cellWidth: 100 },  // Raça
        3: { cellWidth: 120 },  // Registro
        4: { cellWidth: 90 },   // Data
        5: { cellWidth: 'auto' } // Consulta
      },
      didDrawPage: (data) => {
        const pages = doc.internal.getNumberOfPages();
        const str = `Página ${data.pageNumber} de ${pages}`;
        const w = doc.internal.pageSize.getWidth();
        doc.setFontSize(9);
        doc.text(str, w - margem, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      },
    });

    doc.save('relatorio_atendimentos.pdf');
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itensPaginados = resultado.slice(startIndex, endIndex);
  const totalPages = Math.ceil(resultado.length / itemsPerPage);

  const confirmarExclusao = (atendimento) => {
    setAtendimentoSelecionado(atendimento);
    setModalExcluirAberto(true);
  };

  const cancelarExclusao = () => {
    setModalExcluirAberto(false);
    setAtendimentoSelecionado(null);
  };

  const excluirAtendimentoSelecionado = () => {
    if (!atendimentoSelecionado) return;

    axios.delete(`/atendimentos/${atendimentoSelecionado.id}`)
      .then(() => {
        const atualizados = atendimentos.filter(a => a.id !== atendimentoSelecionado.id);
        setAtendimentos(atualizados);
        setResultado(atualizados);
        setModalExcluirAberto(false);
      })
      .catch(error => {
        console.error("Erro ao excluir atendimento:", error);
      });
  };

  return (
    <div className='container-fluid mt-page'>
      <Navbar />

      <CabecalhoEquinos
        titulo="Lista de Atendimentos"
        equinos={equinos}
        filtroNome={filtroNome}
        setFiltroNome={setFiltroNome}
        filtroInicio={filtroInicio}
        setFiltroInicio={setFiltroInicio}
        filtroFim={filtroFim}
        setFiltroFim={setFiltroFim}
        onFiltrar={filtrar}
        limparFiltros={limparFiltros}
        gerarPDF={exportarPDF}
        mostrarDatas={true}
        mostrarBotoesPDF={true}
        mostrarAdicionar={false}
        resultado={resultado}
      />

      <div>
        <table className='table table-hover'>
          <thead>
            <tr>
              <th>Nome do Equino</th>
              <th>Raça</th>
              <th>Número Registro</th>
              <th>Data</th>
              <th>Consulta</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {itensPaginados.map((atendimento, idx) => {
              const equino = equinos.find(eq => eq.id === atendimento.idEquino);
              return (
                <tr key={idx}>
                  <td>{equino?.name || '-'}</td>
                  <td>{equino?.raca || '-'}</td>
                  <td>{equino?.numeroRegistro || '-'}</td>
                  <td>{atendimento.data}</td>
                  <td>{atendimento.textoConsulta}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end">
                      {botoes.includes('editar') && (
                        <BotaoAcaoRows
                          to={`/edit-atendimento/${atendimento.id}`}
                          title="Editar Atendimento"
                          className="botao-editar"
                          icone="bi-pencil"
                        />
                      )}
                      {botoes.includes('excluir') && (
                        <BotaoAcaoRows
                          tipo='button'
                          onClick={() => confirmarExclusao(atendimento)}
                          title="Excluir Atendimento"
                          className="botao-excluir"
                          icone="bi-trash"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className='d-flex justify-content-center'>
          <nav>
            {resultado.length > itemsPerPage && (
              <div className="d-flex justify-content-center mt-1">
                <button
                  className="btn btn-outline-secondary me-2"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Anterior
                </button>

                <span className="align-self-center">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  className="btn btn-outline-secondary ms-2"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Próxima
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>

      <Modal
        isOpen={modalExcluirAberto}
        onRequestClose={cancelarExclusao}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modalContent text-center">
          <FaExclamationTriangle className="icone-exclamacao text-warning mb-3" size={50} />
          <h4 className="mensagem-azul">
            Tem certeza que deseja excluir o atendimento de <strong>{equinos.find(eq => eq.id === atendimentoSelecionado?.idEquino)?.name}</strong>?
          </h4>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button className="btn btn-outline-secondary" onClick={cancelarExclusao}>Cancelar</button>
            <button className="btn btn-danger" onClick={excluirAtendimentoSelecionado}>Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VeterinariaAtendimentoList;

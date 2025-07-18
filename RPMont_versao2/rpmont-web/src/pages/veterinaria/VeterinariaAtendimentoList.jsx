import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar.jsx';
import Modal from 'react-modal';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Veterinaria.css';
import axios from '../../api';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import BotaoAcaoRows from '../../components/botoes/BotaoAcaoRows.jsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

Modal.setAppElement('#root');

const VeterinariaAtendimento = () => {
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
      filtrados = filtrados.filter(a => a.data >= filtroInicio);
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

  const exportarPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Relatório de Atendimentos', 14, 15);

  const dadosTabela = resultado.map((a, i) => {
    const equino = equinos.find(eq => eq.id === a.idEquino);
    return [
      i + 1,
      equino?.name || '-',
      equino?.raca || '-',
      equino?.numeroRegistro || '-',
      a.data,
      a.textoConsulta?.substring(0, 50) || '-', // corta o texto se for muito grande
    ];
  });

  doc.autoTable({
    startY: 20,
    head: [['#', 'Nome do Equino', 'Raça', 'Registro', 'Data', 'Consulta']],
    body: dadosTabela,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] }
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
        resultado={resultado}  // ✅ AQUI
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

export default VeterinariaAtendimento;
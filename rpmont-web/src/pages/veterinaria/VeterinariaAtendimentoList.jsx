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
    carregarEquinos();
    carregarAtendimentos();
    setBotoes(['editar', 'excluir']);
  }, []);

  const carregarEquinos = async () => {
    try {
      const response = await axios.get('/equino');
      console.log('EQUINOS CARREGADOS:', response.data);
      setEquinos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar equinos:', error);
    }
  };

  const carregarAtendimentos = async () => {
    try {
      const response = await axios.get('/atendimentos');
      setAtendimentos(response.data || []);
      setResultado(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
    }
  };

  const obterEquinoAtendimento = (atendimento) => {
    if (!atendimento) return null;

    const equinoId =
      atendimento.equinoId ??
      atendimento.equino?.id ??
      null;

    if (!equinoId) return null;

    return equinos.find(eq => String(eq.id) === String(equinoId)) || null;
  };

  const formatarData = (data) => {
    if (!data) return '-';

    const apenasData = String(data).split('T')[0];
    const [ano, mes, dia] = apenasData.split('-');

    if (!ano || !mes || !dia) return '-';

    return `${dia}/${mes}/${ano}`;
  };

  const filtrar = async () => {
    try {
      const params = {};

      if (filtroNome) {
        params.equinoId = Number(filtroNome);
      }

      if (filtroInicio) {
        params.dataInicio = filtroInicio;
      }

      if (filtroFim) {
        params.dataFim = filtroFim;
      }

      console.log('PARAMS ENVIADOS:', params);

      const response = await axios.get('/atendimentos/filtrar', { params });

      setResultado(response.data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao filtrar atendimentos:', error);
      alert('Erro ao filtrar atendimentos.');
    }
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');
    setResultado(atendimentos);
    setCurrentPage(1);
  };

  const exportarPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    const margem = 40;

    doc.setFontSize(16);
    doc.text('Relatório de Atendimentos', margem, 30);
    doc.setFontSize(10);

    const linhasInfo = [];

    if (filtroNome) {
      const equinoSelecionado = equinos.find(eq => String(eq.id) === String(filtroNome));
      linhasInfo.push(`Equino: ${equinoSelecionado?.nome || filtroNome}`);
    }

    if (filtroInicio) {
      linhasInfo.push(`Início: ${formatarData(filtroInicio)}`);
    }

    if (filtroFim) {
      linhasInfo.push(`Fim: ${formatarData(filtroFim)}`);
    }

    linhasInfo.push(`Total: ${resultado.length}`);

    let y = 48;

    linhasInfo.forEach(texto => {
      doc.text(texto, margem, y);
      y += 16;
    });

    const head = [['#', 'Nome do Equino', 'Raça', 'Registro', 'Data', 'Consulta']];

    const body = resultado.map((atendimento, index) => {
      const equinoEncontrado = obterEquinoAtendimento(atendimento);

      return [
        index + 1,
        atendimento.nomeEquino || equinoEncontrado?.nome || '-',
        atendimento.raca || equinoEncontrado?.raca || '-',
        atendimento.numeroRegistro || equinoEncontrado?.registro || '-',
        formatarData(atendimento.dataAtendimento),
        atendimento.textoConsulta || '-'
      ];
    });

    autoTable(doc, {
      head,
      body,
      startY: y + 8,
      styles: {
        fontSize: 9,
        cellPadding: 5,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [22, 160, 133]
      },
      margin: {
        left: margem,
        right: margem
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 130 },
        2: { cellWidth: 100 },
        3: { cellWidth: 120 },
        4: { cellWidth: 90 },
        5: { cellWidth: 'auto' }
      },
      didDrawPage: (data) => {
        const totalPaginas = doc.internal.getNumberOfPages();
        const largura = doc.internal.pageSize.getWidth();
        const altura = doc.internal.pageSize.getHeight();

        doc.setFontSize(9);
        doc.text(
          `Página ${data.pageNumber} de ${totalPaginas}`,
          largura - margem,
          altura - 10,
          { align: 'right' }
        );
      }
    });

    doc.save('relatorio_atendimentos.pdf');
  };

  const confirmarExclusao = (atendimento) => {
    setAtendimentoSelecionado(atendimento);
    setModalExcluirAberto(true);
  };

  const cancelarExclusao = () => {
    setModalExcluirAberto(false);
    setAtendimentoSelecionado(null);
  };

  const excluirAtendimentoSelecionado = async () => {
    if (!atendimentoSelecionado?.id) return;

    try {
      await axios.delete(`/atendimentos/${atendimentoSelecionado.id}`);

      const atualizados = atendimentos.filter(
        atendimento => atendimento.id !== atendimentoSelecionado.id
      );

      const resultadoAtualizado = resultado.filter(
        atendimento => atendimento.id !== atendimentoSelecionado.id
      );

      setAtendimentos(atualizados);
      setResultado(resultadoAtualizado);
      setModalExcluirAberto(false);
      setAtendimentoSelecionado(null);
    } catch (error) {
      console.error('Erro ao excluir atendimento:', error);
      alert('Erro ao excluir atendimento.');
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itensPaginados = resultado.slice(startIndex, endIndex);
  const totalPages = Math.ceil(resultado.length / itemsPerPage) || 1;

  return (
    <div className="container-fluid mt-page">
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
        <table className="table table-hover">
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
            {itensPaginados.length > 0 ? (
              itensPaginados.map((atendimento) => {
                const equinoEncontrado = obterEquinoAtendimento(atendimento);

                return (
                  <tr key={atendimento.id}>
                    <td>
                      {atendimento.nomeEquino || equinoEncontrado?.nome || '-'}
                    </td>

                    <td>
                      {atendimento.raca || equinoEncontrado?.raca || '-'}
                    </td>

                    <td>
                      {atendimento.numeroRegistro || equinoEncontrado?.registro || '-'}
                    </td>

                    <td>
                      {formatarData(atendimento.dataAtendimento)}
                    </td>

                    <td>
                      {atendimento.textoConsulta || '-'}
                    </td>

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
                            tipo="button"
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
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  Nenhum atendimento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>

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
      </div>

      <Modal
        isOpen={modalExcluirAberto}
        onRequestClose={cancelarExclusao}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modalContent text-center">
          <FaExclamationTriangle
            className="icone-exclamacao text-warning mb-3"
            size={50}
          />

          <h4 className="mensagem-azul">
            Tem certeza que deseja excluir o atendimento de{' '}
            <strong>
              {atendimentoSelecionado?.nomeEquino ||
                obterEquinoAtendimento(atendimentoSelecionado)?.nome ||
                '-'}
            </strong>
            ?
          </h4>

          <div className="d-flex justify-content-center gap-3 mt-4">
            <button
              className="btn btn-outline-secondary"
              onClick={cancelarExclusao}
            >
              Cancelar
            </button>

            <button
              className="btn btn-danger"
              onClick={excluirAtendimentoSelecionado}
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VeterinariaAtendimentoList;
// src/pages/veterinaria/VeterinariaEscalaEquinoList.jsx
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar.jsx';
import Modal from 'react-modal';
import { FaExclamationTriangle } from 'react-icons/fa';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import BotaoAcaoRows from '../../components/botoes/BotaoAcaoRows.jsx';
import './Veterinaria.css';
import axios from '../../api';

// PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Modal.setAppElement('#root');

const VeterinariaEscalaEquinoList = () => {
  const [escala, setEscala] = useState([]);
  const [equinos, setEquinos] = useState([]);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [escalaSelecionado, setEscalaSelecionado] = useState(null);
  const [resultado, setResultado] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const itensPorPagina = 15;
  const botoes = ['editar', 'excluir'];

  useEffect(() => {
    buscarEscala();

    axios.get('/equino')
      .then(response => setEquinos(response.data))
      .catch(error => console.error('Erro ao buscar equinos:', error));
  }, []);

  const buscarEscala = () => {
    axios.get('/escala')
      .then(response => {
        setEscala(response.data);
        setResultado(response.data);
        setPaginaAtual(1);
      })
      .catch(error => console.error('Erro ao buscar escala:', error));
  };

  const getEquinoId = (item) => {
    return item?.equino?.id;
  };

  const getNomeEquino = (item) => {
    return item?.equino?.nome || 'Desconhecido';
  };

  const formatarData = (data) => {
    if (!data) return '-';

    return new Date(data).toLocaleDateString('pt-BR');
  };

  const filtrar = () => {
    axios.get('/escala')
      .then(response => {
        let filtrados = response.data;

        if (filtroNome) {
          filtrados = filtrados.filter(item =>
            String(getEquinoId(item)) === String(filtroNome)
          );
        }

        if (filtroInicio) {
          filtrados = filtrados.filter(item =>
            item.dataCadastro &&
            item.dataCadastro.substring(0, 10) >= filtroInicio
          );
        }

        if (filtroFim) {
          filtrados = filtrados.filter(item =>
            item.dataCadastro &&
            item.dataCadastro.substring(0, 10) <= filtroFim
          );
        }

        setEscala(filtrados);
        setResultado(filtrados);
        setPaginaAtual(1);
      })
      .catch(error => console.error('Erro ao filtrar escala:', error));
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');
    buscarEscala();
  };

  const confirmarExclusao = (item) => {
    setEscalaSelecionado(item);
    setModalExcluirAberto(true);
  };

  const cancelarExclusao = () => {
    setModalExcluirAberto(false);
    setEscalaSelecionado(null);
  };

  const excluirEscala = () => {
    if (!escalaSelecionado?.id) return;

    axios.delete(`/escala/${escalaSelecionado.id}`)
      .then(() => {
        const novaLista = escala.filter(item => item.id !== escalaSelecionado.id);

        setEscala(novaLista);
        setResultado(novaLista);
        setModalExcluirAberto(false);
        setEscalaSelecionado(null);
      })
      .catch(error => console.error('Erro ao excluir escala:', error));
  };

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const escalaPaginada = escala.slice(indexPrimeiroItem, indexUltimoItem);
  const totalPaginas = Math.ceil(escala.length / itensPorPagina) || 1;

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    const margem = 40;

    doc.setFontSize(16);
    doc.text('Lista de Escalas', margem, 30);
    doc.setFontSize(10);

    const info = [];

    if (filtroNome) {
      const equinoSelecionado = equinos.find(e =>
        String(e.id) === String(filtroNome)
      );

      info.push(`Equino: ${equinoSelecionado?.nome || filtroNome}`);
    }

    if (filtroInicio) {
      info.push(`Início: ${formatarData(filtroInicio)}`);
    }

    if (filtroFim) {
      info.push(`Fim: ${formatarData(filtroFim)}`);
    }

    info.push(`Total: ${resultado.length}`);

    let y = 48;

    info.forEach(texto => {
      doc.text(texto, margem, y);
      y += 16;
    });

    const head = [[
      'Nome do Equino',
      'Local de Trabalho',
      'Jornada',
      'Cavaleiro',
      'Data',
      'Observação'
    ]];

    const body = (resultado || []).map(item => ([
      getNomeEquino(item),
      item.localTrabalho || '-',
      item.jornadaTrabalho || '-',
      item.cavaleiro || '-',
      formatarData(item.dataCadastro),
      item.observacao || '-'
    ]));

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
        fillColor: [33, 150, 243]
      },
      margin: {
        left: margem,
        right: margem
      },
      columnStyles: {
        0: { cellWidth: 150 },
        1: { cellWidth: 170 },
        2: { cellWidth: 120 },
        3: { cellWidth: 120 },
        4: { cellWidth: 90 },
        5: { cellWidth: 200 }
      },
      didDrawPage: (data) => {
        const total = doc.internal.getNumberOfPages();
        const largura = doc.internal.pageSize.getWidth();
        const altura = doc.internal.pageSize.getHeight();

        doc.setFontSize(9);
        doc.text(
          `Página ${data.pageNumber} de ${total}`,
          largura - margem,
          altura - 10,
          { align: 'right' }
        );
      }
    });

    doc.save('escala_equinos.pdf');
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <CabecalhoEquinos
        titulo="Lista de Escalas"
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

      <table className="table table-hover">
        <thead>
          <tr>
            <th>Nome do Equino</th>
            <th>Local de Trabalho</th>
            <th>Jornada</th>
            <th>Cavaleiro</th>
            <th>Data</th>
            <th>Observação</th>
            <th className="text-end">Ações</th>
          </tr>
        </thead>

        <tbody>
          {escalaPaginada.length > 0 ? (
            escalaPaginada.map(item => (
              <tr key={item.id}>
                <td>{getNomeEquino(item)}</td>
                <td>{item.localTrabalho || '-'}</td>
                <td>{item.jornadaTrabalho || '-'}</td>
                <td>{item.cavaleiro || '-'}</td>
                <td>{formatarData(item.dataCadastro)}</td>
                <td>{item.observacao || '-'}</td>

                <td className="text-end">
                  <div className="d-flex justify-content-end">
                    {botoes.includes('editar') && (
                      <BotaoAcaoRows
                        to={{
                          pathname: `/escala-equinos/${getEquinoId(item)}`
                        }}
                        state={{
                          modoEdicao: true,
                          escalaId: item.id,
                          equinoId: getEquinoId(item)
                        }}
                        title="Editar Escala"
                        className="botao-editar"
                        icone="bi-pencil"
                      />
                    )}

                    {botoes.includes('excluir') && (
                      <BotaoAcaoRows
                        tipo="button"
                        onClick={() => confirmarExclusao(item)}
                        title="Excluir Escala"
                        className="botao-excluir"
                        icone="bi-trash"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                Nenhuma escala encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-center align-items-center mt-3">
        <button
          className="btn btn-outline-secondary me-2"
          onClick={paginaAnterior}
          disabled={paginaAtual === 1}
        >
          Anterior
        </button>

        <span>Página {paginaAtual} de {totalPaginas}</span>

        <button
          className="btn btn-outline-secondary ms-2"
          onClick={proximaPagina}
          disabled={paginaAtual === totalPaginas}
        >
          Próxima
        </button>
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
            Tem certeza que deseja excluir a escala do equino{' '}
            <strong>{getNomeEquino(escalaSelecionado)}</strong>?
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
              onClick={excluirEscala}
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VeterinariaEscalaEquinoList;
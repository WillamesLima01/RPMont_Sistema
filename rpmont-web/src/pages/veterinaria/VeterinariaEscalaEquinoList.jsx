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
  const [resultado, setResultado] = useState([]); // usado no cabeçalho e no PDF
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 15;

  const botoes = ['editar', 'excluir'];

  useEffect(() => {
    buscarEscala();
    axios.get('/equinos')
      .then(response => setEquinos(response.data))
      .catch(error => console.error("Erro ao buscar equinos:", error));
  }, []);

  const buscarEscala = () => {
    axios.get('/escala')
      .then(response => {
        setEscala(response.data);
        setResultado(response.data); // mantém cabeçalho/total sincronizados
      })
      .catch(error => console.error("Erro ao buscar escala:", error));
  };

  const filtrar = () => {
    axios.get('/escala')
      .then(response => {
        let filtrados = response.data;

        if (filtroNome) {
          filtrados = filtrados.filter(e => e.idEquino === filtroNome);
        }
        if (filtroInicio) {
          filtrados = filtrados.filter(e => e.data >= filtroInicio);
        }
        if (filtroFim) {
          filtrados = filtrados.filter(e => e.data <= filtroFim);
        }

        setEscala(filtrados);
        setResultado(filtrados); // <-- mantém o cabeçalho e o PDF alinhados ao filtro
        setPaginaAtual(1);
      })
      .catch(error => console.error("Erro ao filtrar escala:", error));
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');
    buscarEscala(); // restaura lista completa e resultado
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
    axios.delete(`/escala/${escalaSelecionado.id}`)
      .then(() => {
        const novaLista = escala.filter(e => e.id !== escalaSelecionado.id);
        setEscala(novaLista);
        setResultado(novaLista);
        setModalExcluirAberto(false);
      })
      .catch(error => console.error("Erro ao excluir:", error));
  };

  const getNomeEquino = (idEquino) => {
    const equino = equinos.find(eq => eq.id === idEquino);
    return equino ? equino.name : 'Desconhecido';
  };

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const escalaPaginada = escala.slice(indexPrimeiroItem, indexUltimoItem);
  const totalPaginas = Math.ceil(escala.length / itensPorPagina);

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
  };

  // ====== PDF passado por props (gera a lista filtrada) ======
  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const margem = 40;

    // Cabeçalho
    doc.setFontSize(16);
    doc.text('Lista de Escalas', margem, 30);
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

    // Tabela com base em "resultado" (lista filtrada)
    const head = [['Nome do Equino', 'Local de Trabalho', 'Jornada', 'Cavaleiro', 'Data']];
    const body = (resultado || []).map(item => ([
      getNomeEquino(item.idEquino),
      item.localTrabalho || '-',
      item.jornadaTrabalho || '-',
      item.cavaleiro || '-',
      item.data || '-',
    ]));

    autoTable(doc, {
      head,
      body,
      startY: y + 8,
      styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak' },
      headStyles: { fillColor: [33, 150, 243] },
      margin: { left: margem, right: margem },
      columnStyles: {
        0: { cellWidth: 180 }, // Nome do Equino
        1: { cellWidth: 180 }, // Local
        2: { cellWidth: 120 }, // Jornada
        3: { cellWidth: 140 }, // Cavaleiro
        4: { cellWidth: 90 },  // Data
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

    doc.save('escala_equinos.pdf');
  };

  return (
    <div className='container-fluid mt-page'>
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {escalaPaginada.map(item => (
            <tr key={item.id}>
              <td>{getNomeEquino(item.idEquino)}</td>
              <td>{item.localTrabalho}</td>
              <td>{item.jornadaTrabalho}</td>
              <td>{item.cavaleiro}</td>
              <td>{item.data}</td>
              <td className='text-end'>
                <div className="d-flex justify-content-end">
                  {botoes.includes('editar') && (
                    <BotaoAcaoRows
                      to={{
                        pathname: `/escala-equinos/${item.idEquino}`
                      }}
                      state={{
                        modoEdicao: true,
                        idEscala: item.id
                      }}
                      title="Editar Escala"
                      className="botao-editar"
                      icone="bi-pencil"
                    />
                  )}
                  {botoes.includes('excluir') && (
                    <BotaoAcaoRows
                      tipo='button'
                      onClick={() => confirmarExclusao(item)}
                      title="Excluir Escala"
                      className="botao-excluir"
                      icone="bi-trash"
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='d-flex justify-content-center align-items-center mt-3'>
        <button className='btn btn-outline-secondary me-2' onClick={paginaAnterior} disabled={paginaAtual === 1}>Anterior</button>
        <span>Página {paginaAtual} de {totalPaginas}</span>
        <button className='btn btn-outline-secondary ms-2' onClick={proximaPagina} disabled={paginaAtual === totalPaginas}>Próxima</button>
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
            Tem certeza que deseja excluir a escala do equino <strong>{getNomeEquino(escalaSelecionado?.idEquino)}</strong>?
          </h4>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button className="btn btn-outline-secondary" onClick={cancelarExclusao}>Cancelar</button>
            <button className="btn btn-danger" onClick={excluirEscala}>Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VeterinariaEscalaEquinoList;

// src/pages/veterinaria/VeterinariaFerrageamentoFerrarList.jsx

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar.jsx';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Veterinaria.css';
import axios from '../../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import ModalGenerico from '../../components/modal/ModalGenerico.jsx';
import BotaoAcaoRows from '../../components/botoes/BotaoAcaoRows.jsx';

const VeterinariaFerrageamentoFerrarList = () => {
  const [equinos, setEquinos] = useState([]);
  const [ferrageamentos, setFerrageamentos] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [botoes, setBotoes] = useState(['editar', 'excluir']);

  useEffect(() => {
  const carregarDados = async () => {
    const [eqRes, ferrarRes] = await Promise.all([
      axios.get('/equinos'),
      axios.get('/ferrageamentoEquino'),
    ]);
    setEquinos(eqRes.data);
    setFerrageamentos(ferrarRes.data);
    setResultado(ferrarRes.data);
    setBotoes(['editar', 'excluir']); // <-- aqui está o que faltava
  };
  carregarDados();
}, []);

  const formatarData = (iso) =>
    new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const itensPaginados = resultado.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(resultado.length / itemsPerPage);

  const filtrar = () => {
    let filtrados = ferrageamentos;
    if (filtroNome) filtrados = filtrados.filter(a => a.equinoId === filtroNome);
    if (filtroInicio) filtrados = filtrados.filter(a => new Date(a.data) >= new Date(filtroInicio + 'T00:00:00'));
    if (filtroFim) filtrados = filtrados.filter(a => new Date(a.data) <= new Date(filtroFim + 'T23:59:59'));
    setResultado(filtrados);
    setCurrentPage(1);
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');
    setResultado(ferrageamentos);
    setCurrentPage(1);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Ferrageamento - Ferrar', 14, 15);

    const dadosTabela = resultado.map((f, i) => {
      const equino = equinos.find(eq => eq.id === f.equinoId);
      return [
        i + 1,
        equino?.name || '-',
        formatarData(f.data),
        f.tipoFerradura,
        f.tipoCravo,
        f.tipoJustura,
        f.tipoFerrageamento,
        f.ferros,
        f.cravos,
        f.observacoes || '-',
      ];
    });

    autoTable(doc, {
      startY: 25,
      head: [[
        '#', 'Nome', 'Data', 'Ferradura', 'Cravo', 'Justura',
        'Tipo', 'Ferros', 'Cravos', 'Obs.'
      ]],
      body: dadosTabela,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 152, 219] }
    });

    doc.save('relatorio_ferrageamento.pdf');
  };

  const confirmarExclusao = (item) => {
    setItemSelecionado(item);
    setModalExcluirAberto(true);
  };

  const cancelarExclusao = () => {
    setModalExcluirAberto(false);
    setItemSelecionado(null);
  };

  const excluirItemSelecionado = () => {
    if (!itemSelecionado) return;

    axios.delete(`/ferrageamentoEquino/${itemSelecionado.id}`)
      .then(() => {
        const atualizados = ferrageamentos.filter(f => f.id !== itemSelecionado.id);
        setFerrageamentos(atualizados);
        setResultado(atualizados);
        setModalExcluirAberto(false);
      })
      .catch(error => {
        console.error("Erro ao excluir ferrageamento:", error);
      });
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <CabecalhoEquinos
        titulo="Ferrageamento - Equinos Ferrados"
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
        mostrarAdicionar={false}
        mostrarDatas={true}
        mostrarBotoesPDF={true}
        resultado={resultado}
      />

      <table className="table table-hover">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Data</th>
            <th>Ferradura</th>
            <th>Cravo</th>
            <th>Justura</th>
            <th>Tipo</th>
            <th>Ferros</th>
            <th>Cravos</th>
            <th>Observações</th>
            <th className="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          {itensPaginados.map((item) => {
            const equino = equinos.find(eq => eq.id === item.equinoId);
            return (
              <tr key={item.id}>
                <td>{equino?.name || '-'}</td>
                <td>{formatarData(item.data)}</td>
                <td>{item.tipoFerradura}</td>
                <td>{item.tipoCravo}</td>
                <td>{item.tipoJustura}</td>
                <td>{item.tipoFerrageamento}</td>
                <td>{item.ferros}</td>
                <td>{item.cravos}</td>
                <td>{item.observacoes || '-'}</td>
                <td className="text-end">
                  <div className="d-flex justify-content-end">
                    {botoes.includes('editar') && (
                        <BotaoAcaoRows
                            to={`/veterinaria-ferrageamento-equino/${item.id}`}
                            title="Editar Ferrageamento"
                            className="botao-editar"
                            icone="bi-pencil"
                        />
                    )}
                    {botoes.includes('excluir') && (
                      <BotaoAcaoRows
                        tipo="button"
                        onClick={() => confirmarExclusao(item)}
                        title="Excluir Ferrageamento"
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

      <div className="d-flex justify-content-center">
        <nav>
          <ul className="pagination">
            {[...Array(totalPages)].map((_, index) => (
              <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <ModalGenerico
        open={modalExcluirAberto}
        onClose={cancelarExclusao}
        tipo='confirmacao'
        tamanho='medio'
        icone={<FaExclamationTriangle size={40} color='#f39c12' />}
        titulo='Confirmar Exclusão'
        subtitulo={`Deseja realmente excluir o procedimento do equino "${equinos.find(eq => eq.id === itemSelecionado?.equinoId)?.name}"?`}
      >
        <div className='d-flex justify-content-center gap-3 mt-4'>
          <button className='btn btn-outline-secondary' onClick={cancelarExclusao}>Cancelar</button>
          <button className='btn btn-danger' onClick={excluirItemSelecionado} data-modal-focus>Excluir</button>
        </div>
      </ModalGenerico>
    </div>
  );
};

export default VeterinariaFerrageamentoFerrarList;

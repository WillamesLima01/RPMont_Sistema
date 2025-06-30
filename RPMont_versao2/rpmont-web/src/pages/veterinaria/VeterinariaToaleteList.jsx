import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar.jsx';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Veterinaria.css';
import axios from '../../api';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import BotaoAcaoRows from '../../components/botoes/BotaoAcaoRows.jsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ModalGenerico from '../../components/modal/ModalGenerico.jsx';

const VeterinariaToaleteList = () => {
  const [equinos, setEquinos] = useState([]);
  const [toaletes, setToaletes] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [toaleteSelecionado, setToaleteSelecionado] = useState(null);
  const [botoes, setBotoes] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      const [eqRes, toRes] = await Promise.all([
        axios.get('/equinos'),
        axios.get('/toaletes')
      ]);
      setEquinos(eqRes.data);
      setToaletes(toRes.data);
      setResultado(toRes.data);

      // ✅ Define os botões a serem exibidos
      setBotoes(['editar', 'excluir']);
    };
    carregarDados();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const itensPaginados = resultado.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(resultado.length / itemsPerPage);

  const formatarData = (iso) =>
    new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  const filtrar = () => {
    let filtrados = toaletes;
    if (filtroNome) filtrados = filtrados.filter(t => t.equinoId === filtroNome);
    if (filtroInicio) filtrados = filtrados.filter(t => new Date(t.data) >= new Date(filtroInicio + 'T00:00:00'));
    if (filtroFim) filtrados = filtrados.filter(t => new Date(t.data) <= new Date(filtroFim + 'T23:59:59'));
    setResultado(filtrados);
    setCurrentPage(1);
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');
    setResultado(toaletes);
    setCurrentPage(1);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Toalete dos Equinos', 14, 15);

    const dadosTabela = resultado.map((t, i) => {
      const equino = equinos.find(eq => eq.id === t.equinoId);
      return [
        i + 1,
        equino?.name || '-',
        formatarData(t.data),
        t.tosa ? 'Sim' : 'Não',
        t.banho ? 'Sim' : 'Não',
        t.limpezaOuvidos ? 'Sim' : 'Não',
        t.limpezaGenital ? 'Sim' : 'Não',
        t.limpezaCascos ? 'Sim' : 'Não',
        t.ripagemCrina ? 'Sim' : 'Não',
        t.ripagemCola ? 'Sim' : 'Não',
        t.escovacao ? 'Sim' : 'Não',
        t.rasqueamento ? 'Sim' : 'Não',
        t.observacoes || '-'
      ];
    });

    autoTable(doc, {
      startY: 25,
      head: [[
        '#', 'Nome', 'Data', 'Tosa', 'Banho', 'Ouvidos', 'Genital',
        'Cascos', 'Rip. Crina', 'Rip. Cola', 'Escovação', 'Rasqueamento', 'Obs.'
      ]],
      body: dadosTabela,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] }
    });

    doc.save('relatorio_toalete.pdf');
  };

  const confirmarExclusao = (toalete) => {
    setToaleteSelecionado(toalete);
    setModalExcluirAberto(true);
  };

  const cancelarExclusao = () => {
    setModalExcluirAberto(false);
    setToaleteSelecionado(null);
  };

  const excluirToaleteSelecionado = () => {
    if (!toaleteSelecionado) return;

    axios.delete(`/toaletes/${toaleteSelecionado.id}`)
      .then(() => {
        const atualizados = toaletes.filter(a => a.id !== toaleteSelecionado.id);
        setToaletes(atualizados);
        setResultado(atualizados);
        setModalExcluirAberto(false);
      })
      .catch(error => {
        console.error("Erro ao excluir toalete:", error);
      });
  };

  return (
    <div className='container-fluid mt-page'>
      <Navbar />

      <CabecalhoEquinos
        titulo='Procedimentos de Toalete'
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

      <table className='table table-hover'>
        <thead>
          <tr>
            <th>Nome</th><th>Tosa</th><th>Banho</th><th>Ouvidos</th><th>Genital</th>
            <th>Cascos</th><th>Rip. Crina</th><th>Rip. Cola</th><th>Escovação</th><th>Rasqueamento</th>
            <th>Data</th><th>Observações</th><th className='text-end'>Ações</th>
          </tr>
        </thead>
        <tbody>
          {itensPaginados.map(t => {
            const equino = equinos.find(eq => eq.id === t.equinoId);
            return (
              <tr key={t.id}>
                <td>{equino?.name || '-'}</td><td>{t.tosa ? 'Sim' : 'Não'}</td><td>{t.banho ? 'Sim' : 'Não'}</td>
                <td>{t.limpezaOuvidos ? 'Sim' : 'Não'}</td><td>{t.limpezaGenital ? 'Sim' : 'Não'}</td>
                <td>{t.limpezaCascos ? 'Sim' : 'Não'}</td><td>{t.ripagemCrina ? 'Sim' : 'Não'}</td>
                <td>{t.ripagemCola ? 'Sim' : 'Não'}</td><td>{t.escovacao ? 'Sim' : 'Não'}</td>
                <td>{t.rasqueamento ? 'Sim' : 'Não'}</td><td>{formatarData(t.data)}</td><td>{t.observacoes || '-'}</td>
                <td className='text-end'>
                  <div className='d-flex justify-content-end'>
                    {botoes.includes('editar') && (
                      <BotaoAcaoRows
                        to={`/veterinaria-toalete-equino/${t.id}`}
                        title='Editar Toalete'
                        className='botao-editar'
                        icone='bi-pencil'
                      />
                    )}
                    {botoes.includes('excluir') && (
                      <BotaoAcaoRows
                        tipo='button'
                        onClick={() => confirmarExclusao(t)}
                        title="Excluir Toalete"
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
          <ul className='pagination'>
            {[...Array(totalPages)].map((_, index) => (
              <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button className='page-link' onClick={() => setCurrentPage(index + 1)}>
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
        subtitulo={`Deseja realmente excluir o procedimento do equino "${equinos.find(eq => eq.id === toaleteSelecionado?.equinoId)?.name}"?`}
      >
        <div className='d-flex justify-content-center gap-3 mt-4'>
          <button className='btn btn-outline-secondary' onClick={cancelarExclusao}>Cancelar</button>
          <button className='btn btn-danger' onClick={excluirToaleteSelecionado} data-modal-focus>Excluir</button>
        </div>
      </ModalGenerico>
    </div>
  );
};

export default VeterinariaToaleteList;

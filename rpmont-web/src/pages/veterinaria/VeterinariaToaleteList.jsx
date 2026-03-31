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
      try {
        const [eqRes, toRes] = await Promise.all([
          axios.get('/equino'),
          axios.get('/toalete')
        ]);

        setEquinos(eqRes.data || []);
        setToaletes(toRes.data || []);
        setResultado(toRes.data || []);
        setBotoes(['editar', 'excluir']);
      } catch (error) {
        console.error('Erro ao carregar dados da lista de toalete:', error);
      }
    };

    carregarDados();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const itensPaginados = resultado.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(resultado.length / itemsPerPage);

  const formatarData = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('pt-BR');
  };

  const obterEquinoId = (toalete) => {
    return toalete.equinoId ?? toalete.equino?.id ?? null;
  };

  const obterNomeEquino = (toalete) => {
    const equinoId = obterEquinoId(toalete);
    const equino = equinos.find((eq) => String(eq.id) === String(equinoId));
    return equino?.nome || '-';
  };

  const filtrar = () => {
    let filtrados = [...toaletes];

    if (filtroNome) {
      filtrados = filtrados.filter(
        (t) => String(obterEquinoId(t)) === String(filtroNome)
      );
    }

    if (filtroInicio) {
      filtrados = filtrados.filter((t) => {
        if (!t.dataCadastro) return false;
        return new Date(t.dataCadastro) >= new Date(`${filtroInicio}T00:00:00`);
      });
    }

    if (filtroFim) {
      filtrados = filtrados.filter((t) => {
        if (!t.dataCadastro) return false;
        return new Date(t.dataCadastro) <= new Date(`${filtroFim}T23:59:59`);
      });
    }

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

    const dadosTabela = resultado.map((t, i) => [
      i + 1,
      obterNomeEquino(t),
      formatarData(t.dataCadastro),
      t.tosa ? 'Sim' : 'Não',
      t.banho ? 'Sim' : 'Não',
      t.limpezaOuvidos ? 'Sim' : 'Não',
      t.limpezaGenital ? 'Sim' : 'Não',
      t.limpezaCascos ? 'Sim' : 'Não',
      t.ripagemCrina ? 'Sim' : 'Não',
      t.ripagemCola ? 'Sim' : 'Não',
      t.escovacao ? 'Sim' : 'Não',
      t.rasqueamento ? 'Sim' : 'Não',
      t.observacao || '-'
    ]);

    autoTable(doc, {
      startY: 25,
      head: [[
        '#',
        'Nome',
        'Data',
        'Tosa',
        'Banho',
        'Ouvidos',
        'Genital',
        'Cascos',
        'Rip. Crina',
        'Rip. Cola',
        'Escovação',
        'Rasqueamento',
        'Obs.'
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

  const excluirToaleteSelecionado = async () => {
    if (!toaleteSelecionado) return;

    try {
      await axios.delete(`/toalete/${toaleteSelecionado.id}`);

      const atualizados = toaletes.filter((item) => item.id !== toaleteSelecionado.id);
      setToaletes(atualizados);
      setResultado(atualizados);
      setModalExcluirAberto(false);
      setToaleteSelecionado(null);
    } catch (error) {
      console.error('Erro ao excluir toalete:', error);
    }
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
            <th>Nome</th>
            <th>Tosa</th>
            <th>Banho</th>
            <th>Ouvidos</th>
            <th>Genital</th>
            <th>Cascos</th>
            <th>Rip. Crina</th>
            <th>Rip. Cola</th>
            <th>Escovação</th>
            <th>Rasqueamento</th>
            <th>Data</th>
            <th>Observações</th>
            <th className='text-end'>Ações</th>
          </tr>
        </thead>

        <tbody>
          {itensPaginados.map((toalete) => (
            <tr key={toalete.id}>
              <td>{obterNomeEquino(toalete)}</td>
              <td>{toalete.tosa ? 'Sim' : 'Não'}</td>
              <td>{toalete.banho ? 'Sim' : 'Não'}</td>
              <td>{toalete.limpezaOuvidos ? 'Sim' : 'Não'}</td>
              <td>{toalete.limpezaGenital ? 'Sim' : 'Não'}</td>
              <td>{toalete.limpezaCascos ? 'Sim' : 'Não'}</td>
              <td>{toalete.ripagemCrina ? 'Sim' : 'Não'}</td>
              <td>{toalete.ripagemCola ? 'Sim' : 'Não'}</td>
              <td>{toalete.escovacao ? 'Sim' : 'Não'}</td>
              <td>{toalete.rasqueamento ? 'Sim' : 'Não'}</td>
              <td>{formatarData(toalete.dataCadastro)}</td>
              <td>{toalete.observacao || '-'}</td>
              <td className='text-end'>
                <div className='d-flex justify-content-end'>
                  {botoes.includes('editar') && (
                    <BotaoAcaoRows
                      to={`/veterinaria-toalete-equino/${toalete.equinoId ?? toalete.equino?.id}`}
                      state={{ toaleteId: toalete.id }}
                      title='Editar Toalete'
                      className='botao-editar'
                      icone='bi-pencil'
                    />
                  )}

                  {botoes.includes('excluir') && (
                    <BotaoAcaoRows
                      tipo='button'
                      onClick={() => confirmarExclusao(toalete)}
                      title='Excluir Toalete'
                      className='botao-excluir'
                      icone='bi-trash'
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='d-flex justify-content-center'>
        <nav>
          <ul className='pagination'>
            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index}
                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
              >
                <button
                  className='page-link'
                  onClick={() => setCurrentPage(index + 1)}
                >
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
        subtitulo={`Deseja realmente excluir o procedimento do equino "${toaleteSelecionado ? obterNomeEquino(toaleteSelecionado) : ''}"?`}
      >
        <div className='d-flex justify-content-center gap-3 mt-4'>
          <button className='btn btn-outline-secondary' onClick={cancelarExclusao}>
            Cancelar
          </button>
          <button
            className='btn btn-danger'
            onClick={excluirToaleteSelecionado}
            data-modal-focus
          >
            Excluir
          </button>
        </div>
      </ModalGenerico>
    </div>
  );
};

export default VeterinariaToaleteList;
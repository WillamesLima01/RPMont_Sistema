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
import ModalVermifugacao from '../../components/modal/ModalVermifugacao.jsx';


const VeterinariaVermifugacaoList = () => {
  const [equinos, setEquinos] = useState([]);
  const [vermifugacoes, setVermifugacoes] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [botoes, setBotoes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [equinoSelecionado, setEquinoSelecionado] = useState(null);
  const [dadosEditar, setDadosEditar] = useState(null);


  useEffect(() => {
    const carregarDados = async () => {
      const [eqRes, vermRes] = await Promise.all([
        axios.get('/equinos'),
        axios.get('/vermifugacoes')
      ]);
      setEquinos(eqRes.data);
      setVermifugacoes(vermRes.data);
      setResultado(vermRes.data);
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
    let filtrados = vermifugacoes;
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
    setResultado(vermifugacoes);
    setCurrentPage(1);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Vermifugação dos Equinos', 14, 15);

    const dadosTabela = resultado.map((v, i) => {
      const equino = equinos.find(eq => eq.id === v.equinoId);
      return [
        i + 1,
        equino?.name || '-',
        formatarData(v.data),
        v.vermifugo || '-',
        v.observacao || '-'
      ];
    });

    autoTable(doc, {
      startY: 25,
      head: [['#', 'Nome', 'Data', 'Vermífugo', 'Observações']],
      body: dadosTabela,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [40, 167, 69] }
    });

    doc.save('relatorio_vermifugacao.pdf');
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

    axios.delete(`/vermifugacoes/${itemSelecionado.id}`)
      .then(() => {
        const atualizados = vermifugacoes.filter(a => a.id !== itemSelecionado.id);
        setVermifugacoes(atualizados);
        setResultado(atualizados);
        setModalExcluirAberto(false);
      })
      .catch(error => {
        console.error("Erro ao excluir vermifugação:", error);
      });
  };

  return (
    <div className='container-fluid mt-page'>
      <Navbar />

      <CabecalhoEquinos
        titulo='Procedimentos de Vermifugação'
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
            <th>Vermífugo</th>
            <th>Data</th>
            <th>Observações</th>
            <th className='text-end'>Ações</th>
          </tr>
        </thead>
        <tbody>
          {itensPaginados.map(item => {
            const equino = equinos.find(eq => eq.id === item.equinoId);
            return (
              <tr key={item.id}>
                <td>{equino?.name || '-'}</td>
                <td>{item.vermifugo}</td>
                <td>{formatarData(item.data)}</td>
                <td>{item.observacao || '-'}</td>
                <td className='text-end'>
                  <div className='d-flex justify-content-end'>
                    {botoes.includes('editar') && (
                        <BotaoAcaoRows
                            tipo='button'
                            onClick={() => {
                            const equino = equinos.find(eq => eq.id === item.equinoId);
                            setEquinoSelecionado(equino);
                            setDadosEditar(item);
                            setModalAberto(true);
                            }}
                            title='Editar Vermifugação'
                            className='botao-editar'
                            icone='bi-pencil'
                        />
                    )}
                    {botoes.includes('excluir') && (
                      <BotaoAcaoRows
                        tipo='button'
                        onClick={() => confirmarExclusao(item)}
                        title="Excluir Vermifugação"
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
        subtitulo={`Deseja realmente excluir o procedimento do equino "${equinos.find(eq => eq.id === itemSelecionado?.equinoId)?.name}"?`}
      >
        <div className='d-flex justify-content-center gap-3 mt-4'>
          <button className='btn btn-outline-secondary' onClick={cancelarExclusao}>Cancelar</button>
          <button className='btn btn-danger' onClick={excluirItemSelecionado} data-modal-focus>Excluir</button>
        </div>
      </ModalGenerico>

      <ModalVermifugacao
        open={modalAberto}
        onClose={() => {
            setModalAberto(false);
            setEquinoSelecionado(null);
            setDadosEditar(null);
        }}
        equino={equinoSelecionado}
        dadosEditar={dadosEditar}
      />

    </div>
  );
};

export default VeterinariaVermifugacaoList;

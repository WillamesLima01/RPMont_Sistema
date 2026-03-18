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
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

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

  const HOJE = dayjs().startOf('day');
  const LIMITE_ALERTA = HOJE.add(10, 'day');

  const parseDataSemFuso = (valor) => {
    if (!valor) return null;

    const somenteData = String(valor).slice(0, 10);
    const dt = dayjs(somenteData, 'YYYY-MM-DD', true);

    return dt.isValid() ? dt.startOf('day') : null;
  };

  const formatarData = (valor) => {
    const dt = parseDataSemFuso(valor);
    return dt ? dt.format('DD/MM/YYYY') : '-';
  };

  const proximaDataDe = (item) => {
    return parseDataSemFuso(item?.dataProximoProcedimento);
  };

  const estaProximoDoVencimento = (item) => {
    const prox = proximaDataDe(item);
    if (!prox) return false;

    return prox.isSame(HOJE, 'day') || (
      prox.isAfter(HOJE) && prox.isSameOrBefore(LIMITE_ALERTA, 'day')
    );
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [eqRes, ferrarRes] = await Promise.all([
          axios.get('/equino'),
          axios.get('/ferrageamentoEquino'),
        ]);

        setEquinos(eqRes.data || []);
        setFerrageamentos(ferrarRes.data || []);
        setResultado(ferrarRes.data || []);
        setBotoes(['editar', 'excluir']);
      } catch (error) {
        console.error('Erro ao carregar dados de ferrageamento:', error);
      }
    };

    carregarDados();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const itensPaginados = resultado.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(resultado.length / itemsPerPage);

  const filtrar = () => {
    let filtrados = [...ferrageamentos];

    if (filtroNome) {
      filtrados = filtrados.filter(a => String(a.equinoId) === String(filtroNome));
    }

    if (filtroInicio) {
      const inicio = dayjs(filtroInicio).startOf('day');
      filtrados = filtrados.filter(a => {
        const dataItem = parseDataSemFuso(a.data);
        return dataItem && (dataItem.isSame(inicio, 'day') || dataItem.isAfter(inicio));
      });
    }

    if (filtroFim) {
      const fim = dayjs(filtroFim).endOf('day');
      filtrados = filtrados.filter(a => {
        const dataItem = parseDataSemFuso(a.data);
        return dataItem && (dataItem.isSame(fim, 'day') || dataItem.isBefore(fim));
      });
    }

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
      const equino = equinos.find(eq => String(eq.id) === String(f.equinoId));
      return [
        i + 1,
        equino?.nome || '-',
        formatarData(f.data),
        formatarData(f.dataProximoProcedimento),
        f.tipoFerradura || '-',
        f.tipoCravo || '-',
        f.tipoJustura || '-',
        f.tipoFerrageamento || '-',
        f.ferros ?? '-',
        f.cravos ?? '-',
        f.observacoes || '-',
      ];
    });

    autoTable(doc, {
      startY: 25,
      head: [[
        '#',
        'Nome',
        'Data',
        'Próx. procedimento',
        'Ferradura',
        'Cravo',
        'Justura',
        'Tipo',
        'Ferros',
        'Cravos',
        'Obs.'
      ]],
      body: dadosTabela,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 152, 219] }
    });

    doc.save('relatorio_ferrageamento_ferrar.pdf');
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
        setItemSelecionado(null);
      })
      .catch(error => {
        console.error('Erro ao excluir ferrageamento:', error);
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
            <th>Próx. procedimento</th>
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
            const equino = equinos.find(eq => String(eq.id) === String(item.equinoId));
            const proximoDoVencimento = estaProximoDoVencimento(item);
            const estiloAlerta = proximoDoVencimento ? { backgroundColor: '#f8d7da' } : {};

            return (
              <tr key={item.id}>
                <td style={estiloAlerta}>{equino?.nome || '-'}</td>
                <td style={estiloAlerta}>{formatarData(item.data)}</td>
                <td style={estiloAlerta}>{formatarData(item.dataProximoProcedimento)}</td>
                <td style={estiloAlerta}>{item.tipoFerradura || '-'}</td>
                <td style={estiloAlerta}>{item.tipoCravo || '-'}</td>
                <td style={estiloAlerta}>{item.tipoJustura || '-'}</td>
                <td style={estiloAlerta}>{item.tipoFerrageamento || '-'}</td>
                <td style={estiloAlerta}>{item.ferros ?? '-'}</td>
                <td style={estiloAlerta}>{item.cravos ?? '-'}</td>
                <td style={estiloAlerta}>{item.observacoes || '-'}</td>
                <td className="text-end" style={estiloAlerta}>
                  <div className="d-flex justify-content-end">
                    {botoes.includes('editar') && (
                      <BotaoAcaoRows
                        to={`/veterinaria-ferrageamento-equino/ferrar/${item.id}`}
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
              <li
                key={index}
                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
              >
                <button
                  className="page-link"
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
        tipo="confirmacao"
        tamanho="medio"
        icone={<FaExclamationTriangle size={40} color="#f39c12" />}
        titulo="Confirmar Exclusão"
        subtitulo={`Deseja realmente excluir o procedimento do equino "${equinos.find(eq => String(eq.id) === String(itemSelecionado?.equinoId))?.nome || ''}"?`}
      >
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-outline-secondary" onClick={cancelarExclusao}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={excluirItemSelecionado} data-modal-focus>
            Excluir
          </button>
        </div>
      </ModalGenerico>
    </div>
  );
};

export default VeterinariaFerrageamentoFerrarList;
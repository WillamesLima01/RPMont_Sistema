import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar.jsx';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Veterinaria.css';
import axios from '../../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import ModalGenerico from '../../components/modal/ModalGenerico.jsx';
import BotaoAcaoRows from '../../components/botoes/BotaoAcaoRows.jsx';

const VeterinariaFerrageamentoCurativoList = () => {
  const location = useLocation();
  const equinoIdRecebido = location.state?.equinoId;

  const [equinos, setEquinos] = useState([]);
  const [curativos, setCurativos] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [botoes] = useState(['editar', 'excluir']);

  const DIAS_ALERTA_CURATIVO = 15;
  const DIAS_VALIDADE_CURATIVO = 45;

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [eqRes, curRes] = await Promise.all([
          axios.get('/equino'),
          axios.get('/ferrageamento_curativo_equino'),
        ]);

        setEquinos(eqRes.data || []);
        setCurativos(curRes.data || []);
        setResultado(curRes.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados de curativo:', error);
      }
    };

    carregarDados();
  }, []);

  useEffect(() => {
    if (!equinoIdRecebido || curativos.length === 0) return;

    const filtrados = curativos.filter((item) => {
      return String(item.equinoId) === String(equinoIdRecebido);
    });

    setFiltroNome(String(equinoIdRecebido));
    setResultado(filtrados);
    setCurrentPage(1);
  }, [equinoIdRecebido, curativos]);

  const normalizarTexto = (texto) => {
    return String(texto || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();
  };

  const obterEquinoId = (item) => {
    return item?.equinoId;
  };

  const obterChaveCurativo = (item) => {
    const equinoId = obterEquinoId(item);
    const tipoCurativo = normalizarTexto(item?.tipoCurativo);

    if (!equinoId || !tipoCurativo) return null;

    return `${equinoId}-${tipoCurativo}`;
  };

  const normalizarData = (data) => {
    if (!data) return null;

    const somenteData = String(data).slice(0, 10);
    const [ano, mes, dia] = somenteData.split('-').map(Number);

    if (!ano || !mes || !dia) return null;

    return new Date(ano, mes - 1, dia);
  };

  const formatarData = (data) => {
    const dataNormalizada = normalizarData(data);

    if (!dataNormalizada) return '-';

    return dataNormalizada.toLocaleDateString('pt-BR');
  };

  const obterDataReferencia = (item) => {
    return normalizarData(item?.dataCadastro || item?.data);
  };

  const obterDataVencimentoCurativo = (item) => {
    if (item?.dataProximoProcedimento) {
      return normalizarData(item.dataProximoProcedimento);
    }

    const dataBase = obterDataReferencia(item);

    if (!dataBase) return null;

    const dataVencimento = new Date(dataBase);
    dataVencimento.setDate(dataVencimento.getDate() + DIAS_VALIDADE_CURATIVO);

    return dataVencimento;
  };

  const curativoPertoDeVencer = (item) => {
    const dataVencimento = obterDataVencimentoCurativo(item);

    if (!dataVencimento) return false;

    const hoje = new Date();
    const hojeLocal = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    );

    const diferencaEmMs = dataVencimento.getTime() - hojeLocal.getTime();
    const diasRestantes = Math.ceil(diferencaEmMs / (1000 * 60 * 60 * 24));

    return diasRestantes >= 0 && diasRestantes <= DIAS_ALERTA_CURATIVO;
  };

  const ultimosCurativosPorEquinoETipo = useMemo(() => {
    const mapa = new Map();

    curativos.forEach((item) => {
      const chave = obterChaveCurativo(item);
      const dataItem = obterDataReferencia(item);

      if (!chave || !dataItem) return;

      const atual = mapa.get(chave);

      if (!atual) {
        mapa.set(chave, item);
        return;
      }

      const dataAtual = obterDataReferencia(atual);

      if (!dataAtual || dataItem > dataAtual) {
        mapa.set(chave, item);
      }
    });

    return mapa;
  }, [curativos]);

  const deveDestacarCurativo = (item) => {
    const chave = obterChaveCurativo(item);

    if (!chave) return false;

    const ultimoCurativoMesmoTipo = ultimosCurativosPorEquinoETipo.get(chave);
    const ehUltimoRegistroDoMesmoTipo =
      String(ultimoCurativoMesmoTipo?.id) === String(item.id);

    return ehUltimoRegistroDoMesmoTipo && curativoPertoDeVencer(item);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const itensPaginados = resultado.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(resultado.length / itemsPerPage);

  const filtrar = () => {
    let filtrados = [...curativos];

    if (filtroNome) {
      filtrados = filtrados.filter((item) => {
        return String(item.equinoId) === String(filtroNome);
      });
    }

    if (filtroInicio) {
      filtrados = filtrados.filter((item) => {
        if (!item.dataCadastro) return false;

        return new Date(item.dataCadastro) >= new Date(`${filtroInicio}T00:00:00`);
      });
    }

    if (filtroFim) {
      filtrados = filtrados.filter((item) => {
        if (!item.dataCadastro) return false;

        return new Date(item.dataCadastro) <= new Date(`${filtroFim}T23:59:59`);
      });
    }

    setResultado(filtrados);
    setCurrentPage(1);
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');
    setResultado(curativos);
    setCurrentPage(1);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Relatório de Ferrageamento - Curativo', 14, 15);

    const dadosTabela = resultado.map((item, i) => {
      const equino = equinos.find(
        (eq) => String(eq.id) === String(obterEquinoId(item))
      );

      return [
        i + 1,
        equino?.nome || '-',
        formatarData(item.dataCadastro || item.data),
        item.tipoCurativo || '-',
        item.observacoes || '-',
      ];
    });

    autoTable(doc, {
      startY: 25,
      head: [['#', 'Nome', 'Data', 'Tipo de Curativo', 'Observações']],
      body: dadosTabela,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 152, 219] },
    });

    doc.save('relatorio_curativo.pdf');
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

    axios.delete(`/ferrageamento_curativo_equino/${itemSelecionado.id}`)
      .then(() => {
        const atualizados = curativos.filter((c) => c.id !== itemSelecionado.id);

        setCurativos(atualizados);
        setResultado(atualizados);
        setModalExcluirAberto(false);
        setItemSelecionado(null);
      })
      .catch((error) => {
        console.error('Erro ao excluir curativo:', error);
      });
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <CabecalhoEquinos
        titulo="Ferrageamento - Curativo"
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
            <th>Tipo de Curativo</th>
            <th>Observações</th>
            <th className="text-end">Ações</th>
          </tr>
        </thead>

        <tbody>
          {itensPaginados.map((item) => {
            const equino = equinos.find(
              (eq) => String(eq.id) === String(obterEquinoId(item))
            );

            const destacarLinha = deveDestacarCurativo(item);

            return (
              <tr
                key={item.id}
                className={destacarLinha ? 'linha-procedimento-vencendo' : ''}
              >
                <td>{equino?.nome || '-'}</td>
                <td>{formatarData(item.dataCadastro || item.data)}</td>
                <td>{item.tipoCurativo || '-'}</td>
                <td>{item.observacoes || '-'}</td>

                <td className="text-end">
                  <div className="d-flex justify-content-end">
                    {botoes.includes('editar') && (
                      <BotaoAcaoRows
                        tipo="link"
                        to={`/ferrageamento-form/curativo/${item.id}`}
                        title="Editar Curativo"
                        className="botao-editar"
                        icone="bi-pencil"
                      />
                    )}

                    {botoes.includes('excluir') && (
                      <BotaoAcaoRows
                        tipo="button"
                        onClick={() => confirmarExclusao(item)}
                        title="Excluir Curativo"
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
        subtitulo={`Deseja realmente excluir o curativo do equino "${
          equinos.find(
            (eq) => String(eq.id) === String(obterEquinoId(itemSelecionado || {}))
          )?.nome || ''
        }"?`}
      >
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button
            className="btn btn-outline-secondary"
            onClick={cancelarExclusao}
          >
            Cancelar
          </button>

          <button
            className="btn btn-danger"
            onClick={excluirItemSelecionado}
            data-modal-focus
          >
            Excluir
          </button>
        </div>
      </ModalGenerico>
    </div>
  );
};

export default VeterinariaFerrageamentoCurativoList;
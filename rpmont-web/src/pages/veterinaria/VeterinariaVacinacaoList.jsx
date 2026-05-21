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
import ModalVacinacao from '../../components/modal/ModalVacinacao.jsx';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

const VeterinariaVacinacaoList = () => {
  const [equinos, setEquinos] = useState([]);
  const [vacinacoes, setVacinacoes] = useState([]);
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

  const HOJE = dayjs().startOf('day');
  const LIMITE = HOJE.add(15, 'day');

  const proximaDataDe = (item) => {
    const data = item?.dataProximoProcedimento || item?.proximaData || item?.data;

    if (!data) return null;

    const somenteData = String(data).slice(0, 10);
    const dt = dayjs(somenteData, 'YYYY-MM-DD', true);

    return dt.isValid() ? dt.startOf('day') : null;
  };

  const estaDentroDe15Dias = (item) => {
    const proximaData = proximaDataDe(item);

    if (!proximaData) return false;

    return (
      proximaData.isSame(HOJE, 'day') ||
      (proximaData.isAfter(HOJE) && proximaData.isSameOrBefore(LIMITE))
    );
  };

  const carregarDados = async () => {
    try {
      const [eqRes, vacRes] = await Promise.all([
        axios.get('/equino'),
        axios.get('/vacinacao')
      ]);

      const listaEquinos = Array.isArray(eqRes.data) ? eqRes.data : [];
      const listaVacinacoes = Array.isArray(vacRes.data) ? vacRes.data : [];

      setEquinos(listaEquinos);
      setVacinacoes(listaVacinacoes);
      setResultado(listaVacinacoes);
      setBotoes(['editar', 'excluir']);
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao carregar dados de vacinação:', error);
      console.log('Erro backend:', error.response?.data);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const itensPaginados = resultado.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(resultado.length / itemsPerPage) || 1;

  const formatarQuantidade = (item) => {
    const quantidade = item?.qtdeMedicamento;
    const unidade = item?.unidadeMedicamento;

    if (quantidade === null || quantidade === undefined || quantidade === '') {
      return '-';
    }

    return `${quantidade} ${unidade || ''}`.trim();
  };

  const formatarData = (iso) => {
    if (!iso) return '-';

    const somenteData = String(iso).slice(0, 10);
    const [ano, mes, dia] = somenteData.split('-');

    if (!ano || !mes || !dia) return '-';

    return `${dia}/${mes}/${ano}`;
  };

  const obterOrigemMedicamento = (item) => {
    const origem = String(item?.origemMedicamento || '').toUpperCase();

    if (origem === 'ESTOQUE') return 'ESTOQUE';
    if (origem === 'EXTERNO') return 'EXTERNO';

    return null;
  };

  const obterTextoOrigem = (item) => {
    const origem = obterOrigemMedicamento(item);

    if (origem === 'ESTOQUE') return 'Estoque';
    if (origem === 'EXTERNO') return 'Externo';

    return 'Não informado';
  };

  const obterClasseBadgeOrigem = (item) => {
    const origem = obterOrigemMedicamento(item);

    if (origem === 'ESTOQUE') return 'badge bg-success';
    if (origem === 'EXTERNO') return 'badge bg-warning text-dark';

    return 'badge bg-secondary';
  };

  const formatarVacinaPDF = (item) => {
    const nomeVacina = item?.nomeVacina || item?.vacina || '-';
    const origem = obterTextoOrigem(item);

    return origem === 'Não informado'
      ? `${nomeVacina} (origem não informada)`
      : `${nomeVacina} (${origem})`;
  };

  const filtrar = () => {
    let filtrados = [...vacinacoes];

    if (filtroNome) {
      filtrados = filtrados.filter(
        (item) => String(item.equinoId) === String(filtroNome)
      );
    }

    if (filtroInicio) {
      filtrados = filtrados.filter((item) => {
        const dataItem = item.dataProximoProcedimento || item.proximaData || item.data;

        if (!dataItem) return false;

        return new Date(`${String(dataItem).slice(0, 10)}T00:00:00`) >=
          new Date(`${filtroInicio}T00:00:00`);
      });
    }

    if (filtroFim) {
      filtrados = filtrados.filter((item) => {
        const dataItem = item.dataProximoProcedimento || item.proximaData || item.data;

        if (!dataItem) return false;

        return new Date(`${String(dataItem).slice(0, 10)}T23:59:59`) <=
          new Date(`${filtroFim}T23:59:59`);
      });
    }

    setResultado(filtrados);
    setCurrentPage(1);
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');
    setResultado(vacinacoes);
    setCurrentPage(1);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Relatório de Vacinação dos Equinos', 14, 15);

    const dadosTabela = resultado.map((v, i) => {
      const equino = equinos.find(
        (eq) => String(eq.id) === String(v.equinoId)
      );

      return [
        i + 1,
        equino?.nome || v.nomeEquino || '-',
        formatarVacinaPDF(v),
        formatarQuantidade(v),
        formatarData(v.dataProximoProcedimento || v.proximaData || v.data),
        v.observacao || '-'
      ];
    });

    autoTable(doc, {
      startY: 25,
      head: [
        [
          '#',
          'Nome',
          'Vacina',
          'Quantidade',
          'Data da próxima dose',
          'Observações'
        ]
      ],
      body: dadosTabela,
      styles: {
        fontSize: 10,
        cellPadding: 4,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [52, 152, 219]
      }
    });

    doc.save('relatorio_vacinacao.pdf');
  };

  const confirmarExclusao = (item) => {
    setItemSelecionado(item);
    setModalExcluirAberto(true);
  };

  const cancelarExclusao = () => {
    setModalExcluirAberto(false);
    setItemSelecionado(null);
  };

  const excluirItemSelecionado = async () => {
    if (!itemSelecionado?.id) return;

    try {
      await axios.delete(`/vacinacao/${itemSelecionado.id}`);

      const atualizados = vacinacoes.filter(
        (item) => item.id !== itemSelecionado.id
      );

      setVacinacoes(atualizados);
      setResultado(atualizados);
      setModalExcluirAberto(false);
      setItemSelecionado(null);
    } catch (error) {
      console.error('Erro ao excluir vacinação:', error);
      console.log('Erro backend:', error.response?.data);
    }
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <CabecalhoEquinos
        titulo="Procedimentos de Vacinação"
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
            <th>Vacina</th>
            <th>Quantidade</th>
            <th>Data da Aplicação</th>
            <th>Data da próxima dose</th>
            <th>Observações</th>
            <th className="text-end">Ações</th>
          </tr>
        </thead>

        <tbody>
          {itensPaginados.length > 0 ? (
            itensPaginados.map((item) => {
              const equino = equinos.find(
                (eq) => String(eq.id) === String(item.equinoId)
              );

              const dentro15 = estaDentroDe15Dias(item);

              return (
                <tr key={item.id} className={dentro15 ? 'table-danger' : ''}>
                  <td>{equino?.nome || item.nomeEquino || '-'}</td>

                  <td>
                    <div className="d-flex flex-column align-items-start gap-1">
                      <span>{item.nomeVacina || item.vacina || '-'}</span>

                      <span className={obterClasseBadgeOrigem(item)}>
                        {obterTextoOrigem(item)}
                      </span>
                    </div>
                  </td>

                  <td>{formatarQuantidade(item)}</td>
                  
                  <td>{formatarData(item.dataCadastro || item.data)}</td>

                  <td>
                    {formatarData(item.dataProximoProcedimento || item.proximaData || item.data)}
                  </td>

                  <td>{item.observacao || '-'}</td>

                  <td className="text-end">
                    <div className="d-flex justify-content-end">
                      {botoes.includes('editar') && (
                        <BotaoAcaoRows
                          tipo="button"
                          onClick={() => {
                            const equinoEncontrado = equinos.find(
                              (eq) => String(eq.id) === String(item.equinoId)
                            );

                            setEquinoSelecionado(equinoEncontrado);
                            setDadosEditar(item);
                            setModalAberto(true);
                          }}
                          title="Editar Vacinação"
                          className="botao-editar"
                          icone="bi-pencil"
                        />
                      )}

                      {botoes.includes('excluir') && (
                        <BotaoAcaoRows
                          tipo="button"
                          onClick={() => confirmarExclusao(item)}
                          title="Excluir Vacinação"
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
                Nenhuma vacinação encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {resultado.length > itemsPerPage && (
        <div className="d-flex justify-content-center">
          <nav>
            <ul className="pagination">
              {[...Array(totalPages)].map((_, index) => (
                <li
                  key={index}
                  className={`page-item ${
                    currentPage === index + 1 ? 'active' : ''
                  }`}
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
      )}

      <ModalGenerico
        open={modalExcluirAberto}
        onClose={cancelarExclusao}
        tipo="confirmacao"
        tamanho="medio"
        icone={<FaExclamationTriangle size={40} color="#f39c12" />}
        titulo="Confirmar Exclusão"
        subtitulo={`Deseja realmente excluir a vacinação do equino "${
          equinos.find(
            (eq) => String(eq.id) === String(itemSelecionado?.equinoId)
          )?.nome || itemSelecionado?.nomeEquino || '-'
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

      <ModalVacinacao
        open={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setEquinoSelecionado(null);
          setDadosEditar(null);
          carregarDados();
        }}
        equino={equinoSelecionado}
        dadosEditar={dadosEditar}
      />
    </div>
  );
};

export default VeterinariaVacinacaoList;

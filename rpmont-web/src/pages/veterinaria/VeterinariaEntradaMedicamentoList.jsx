import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import Modal from 'react-modal';
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import "../../../index.css";
import './Veterinaria.css';

Modal.setAppElement('#root');

const ITENS_POR_PAGINA = 8;

const VeterinariaEntradaMedicamentoList = () => {
  const navigate = useNavigate();

  const [entradas, setEntradas] = useState([]);
  const [busca, setBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [entradaSelecionada, setEntradaSelecionada] = useState(null);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [modalErroAberto, setModalErroAberto] = useState(false);

  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagensErro, setMensagensErro] = useState([]);

  useEffect(() => {
    carregarEntradas();
  }, []);

  const carregarEntradas = async () => {
    try {
      const response = await axios.get('/entradasMedicamento');
      const lista = Array.isArray(response.data) ? response.data : [];

      const ordenada = [...lista].sort((a, b) => {
        const dataA = new Date(a.dataEntrada || 0).getTime();
        const dataB = new Date(b.dataEntrada || 0).getTime();
        return dataB - dataA;
      });

      setEntradas(ordenada);
    } catch (error) {
      console.error('Erro ao carregar entradas de medicamentos:', error);
      setMensagensErro(['Erro ao carregar entradas de medicamentos.']);
      setModalErroAberto(true);
    }
  };

  const normalizar = (texto) =>
    (texto || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const formatarData = (data) => {
    if (!data) return '-';
    const dt = new Date(`${data}T00:00:00`);
    if (Number.isNaN(dt.getTime())) return data;
    return dt.toLocaleDateString('pt-BR');
  };

  const entradasFiltradas = useMemo(() => {
    const buscaNormalizada = normalizar(busca);

    return entradas.filter((entrada) => {
      const medicamentoNome = normalizar(entrada.medicamentoNome);
      const fabricante = normalizar(entrada.fabricante);
      const lote = normalizar(entrada.lote);
      const fornecedor = normalizar(entrada.fornecedor);

      const atendeBusca =
        !buscaNormalizada ||
        medicamentoNome.includes(buscaNormalizada) ||
        fabricante.includes(buscaNormalizada) ||
        lote.includes(buscaNormalizada) ||
        fornecedor.includes(buscaNormalizada);

      const atendeData =
        !dataFiltro || entrada.dataEntrada === dataFiltro;

      return atendeBusca && atendeData;
    });
  }, [entradas, busca, dataFiltro]);

  const totalPaginas = Math.ceil(entradasFiltradas.length / ITENS_POR_PAGINA) || 1;

  const entradasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return entradasFiltradas.slice(inicio, fim);
  }, [entradasFiltradas, paginaAtual]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, dataFiltro]);

  const limparFiltros = () => {
    setBusca('');
    setDataFiltro('');
    setPaginaAtual(1);
  };

  const editarEntrada = (entradaId) => {
    navigate(`/medicamentoEditarEntradaForm/${entradaId}`);
  };

  const abrirModalExcluir = (entrada) => {
    setEntradaSelecionada(entrada);
    setModalExcluirAberto(true);
  };

  const fecharModalExcluir = () => {
    setEntradaSelecionada(null);
    setModalExcluirAberto(false);
  };

  const fecharModalErro = () => {
    setModalErroAberto(false);
    setMensagensErro([]);
  };

  const excluirEntrada = async () => {
    if (!entradaSelecionada) return;

    try {
      await axios.delete(`/entradasMedicamento/${entradaSelecionada.id}`);

      const novaLista = entradas.filter(
        (item) => item.id !== entradaSelecionada.id
      );

      setEntradas(novaLista);
      setModalExcluirAberto(false);
      setEntradaSelecionada(null);

      setMensagemSucesso('Entrada excluída com sucesso!');
      setModalSucessoAberto(true);

      setTimeout(() => {
        setModalSucessoAberto(false);
      }, 2500);
    } catch (error) {
      const data = error.response?.data;

      let msgs = [];
      if (typeof data === 'string') {
        msgs = [data];
      } else if (Array.isArray(data)) {
        msgs = data;
      } else if (data?.messages) {
        msgs = data.messages;
      } else if (data && typeof data === 'object') {
        msgs = Object.values(data);
      } else {
        msgs = ['Erro ao excluir entrada de medicamento.'];
      }

      setMensagensErro(msgs.map(String));
      setModalErroAberto(true);
      setModalExcluirAberto(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-12 mt-5">

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-5 mb-4">
              <div>
                <h2 className="titulo-principal mb-1">Entradas de Medicamentos</h2>
                <p className="text-muted mb-0">
                  Visualize, filtre, edite e exclua os lançamentos de entrada do estoque.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/medicamentoList')}
              >
                Voltar para Medicamentos
              </button>
            </div>

            <div className="card shadow-sm border-0 rounded-4 mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-end">

                  <div className="col-md-6">
                    <label className="form-label">Buscar por medicamento, fabricante, lote ou fornecedor</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Digite para buscar..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Data da Entrada</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dataFiltro}
                      onChange={(e) => setDataFiltro(e.target.value)}
                    />
                  </div>

                  <div className="col-md-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      onClick={limparFiltros}
                    >
                      Limpar filtros
                    </button>
                  </div>

                  <div className="col-md-1 text-md-end">
                    <div className="fw-semibold">
                      {entradasFiltradas.length}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Medicamento</th>
                        <th>Fabricante</th>
                        <th>Lote</th>
                        <th>Validade</th>
                        <th>Quantidade</th>
                        <th>Qtde Base</th>
                        <th>Data Entrada</th>
                        <th>Fornecedor</th>
                        <th className="text-center pe-3">Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {entradasPaginadas.length > 0 ? (
                        entradasPaginadas.map((entrada) => (
                          <tr key={entrada.id}>
                            <td className="ps-3">
                              <div className="fw-semibold">{entrada.medicamentoNome || '-'}</div>
                              <small className="text-muted">
                                ID medicamento: {entrada.medicamentoId || '-'}
                              </small>
                            </td>

                            <td>{entrada.fabricante || '-'}</td>
                            <td>{entrada.lote || '-'}</td>
                            <td>{formatarData(entrada.validade)}</td>

                            <td>
                              {entrada.quantidadeInformada ?? '-'} {entrada.unidadeInformada || ''}
                            </td>

                            <td>
                              {entrada.quantidadeBase ?? '-'} {entrada.unidadeBase || ''}
                            </td>

                            <td>{formatarData(entrada.dataEntrada)}</td>
                            <td>{entrada.fornecedor || '-'}</td>

                            <td className="text-center pe-3">
                              <div className="d-flex justify-content-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-warning"
                                  title="Editar entrada"
                                  onClick={() => editarEntrada(entrada.id)}
                                >
                                  <FaEdit />
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  title="Excluir entrada"
                                  onClick={() => abrirModalExcluir(entrada)}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-4 text-muted">
                            Nenhuma entrada encontrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4 mb-5">
              <div className="text-muted">
                Página {paginaAtual} de {totalPaginas}
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={paginaAtual === 1}
                  onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                >
                  Anterior
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
                >
                  Próxima
                </button>
              </div>
            </div>

            <Modal
              isOpen={modalExcluirAberto}
              onRequestClose={fecharModalExcluir}
              className="modal"
              overlayClassName="overlay"
            >
              <div className="modalContent text-center">
                <FaExclamationTriangle className="icone-interrogacao" />
                <h2 className="mensagem-azul">Deseja excluir esta entrada?</h2>
                <p className="mt-2">
                  {entradaSelecionada?.medicamentoNome || ''} - Lote {entradaSelecionada?.lote || ''}
                </p>

                <div className="modalButtons mt-3">
                  <button
                    onClick={excluirEntrada}
                    className="btn btn-confirmar me-2"
                  >
                    Excluir
                  </button>
                  <button
                    onClick={fecharModalExcluir}
                    className="btn btn-cancelar"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </Modal>

            <Modal
              isOpen={modalSucessoAberto}
              className="modal"
              overlayClassName="overlay"
            >
              <div className="modalContent text-center">
                <FaCheckCircle className="icone-sucesso" />
                <h2 className="mensagem-azul">{mensagemSucesso}</h2>
              </div>
            </Modal>

            <Modal
              isOpen={modalErroAberto}
              onRequestClose={fecharModalErro}
              className="modal"
              overlayClassName="overlay"
            >
              <div className="modalContent text-center">
                <FaExclamationTriangle className="icone-erro" />
                <h2>Ocorreu um erro:</h2>
                {mensagensErro.map((mensagem, index) => (
                  <h5 key={index} className="text-danger">{mensagem}</h5>
                ))}
                <button
                  onClick={fecharModalErro}
                  className="btn btn-outline-secondary mt-3"
                >
                  Fechar
                </button>
              </div>
            </Modal>

          </div>
        </div>
      </div>
    </>
  );
};

export default VeterinariaEntradaMedicamentoList;
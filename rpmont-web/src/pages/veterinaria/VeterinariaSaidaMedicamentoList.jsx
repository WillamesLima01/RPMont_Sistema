import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import Modal from 'react-modal';
import {
  FaTrash,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import "../../../index.css";
import './Veterinaria.css';

Modal.setAppElement('#root');

const ITENS_POR_PAGINA = 8;

const VeterinariaSaidaMedicamentoList = () => {
  const navigate = useNavigate();

  const [saidas, setSaidas] = useState([]);
  const [busca, setBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [saidaSelecionada, setSaidaSelecionada] = useState(null);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [modalErroAberto, setModalErroAberto] = useState(false);

  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagensErro, setMensagensErro] = useState([]);

  useEffect(() => {
    carregarSaidas();
  }, []);

  const carregarSaidas = async () => {
    try {
      const response = await axios.get('/saidas_medicamento');
      const lista = Array.isArray(response.data) ? response.data : [];

      const ordenada = [...lista].sort((a, b) => {
        const dataA = new Date(a.dataSaida || 0).getTime();
        const dataB = new Date(b.dataSaida || 0).getTime();
        return dataB - dataA;
      });

      setSaidas(ordenada);
    } catch (error) {
      console.error('Erro ao carregar saídas de medicamentos:', error);
      setMensagensErro(['Erro ao carregar saídas de medicamentos.']);
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
    const dt = new Date(`${String(data).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(dt.getTime())) return data;
    return dt.toLocaleDateString('pt-BR');
  };

  const formatarTipoSaida = (tipo) => {
    if (!tipo) return '-';
    if (tipo === 'ATENDIMENTO') return 'Atendimento';
    if (tipo === 'VERMIFUGACAO') return 'Vermifugação';
    if (tipo === 'VACINACAO') return 'Vacinação';
    return tipo;
  };

  const formatarOrigem = (saida) => {
    return saida?.medicacaoExterna ? 'Externo' : 'Estoque';
  };

  const saidasFiltradas = useMemo(() => {
    const buscaNormalizada = normalizar(busca);

    return saidas.filter((saida) => {
      const medicamentoNome = normalizar(saida.medicamentoNome);
      const fabricante = normalizar(saida.fabricante);
      const nomeEquino = normalizar(saida.nomeEquino);
      const observacao = normalizar(saida.observacao);
      const tipoSaida = normalizar(saida.tipoSaida);

      const atendeBusca =
        !buscaNormalizada ||
        medicamentoNome.includes(buscaNormalizada) ||
        fabricante.includes(buscaNormalizada) ||
        nomeEquino.includes(buscaNormalizada) ||
        observacao.includes(buscaNormalizada) ||
        tipoSaida.includes(buscaNormalizada);

      const atendeData =
        !dataFiltro || saida.dataSaida === dataFiltro;

      const atendeTipo =
        !tipoFiltro || saida.tipoSaida === tipoFiltro;

      return atendeBusca && atendeData && atendeTipo;
    });
  }, [saidas, busca, dataFiltro, tipoFiltro]);

  const totalPaginas = Math.ceil(saidasFiltradas.length / ITENS_POR_PAGINA) || 1;

  const saidasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return saidasFiltradas.slice(inicio, fim);
  }, [saidasFiltradas, paginaAtual]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, dataFiltro, tipoFiltro]);

  const limparFiltros = () => {
    setBusca('');
    setDataFiltro('');
    setTipoFiltro('');
    setPaginaAtual(1);
  };

  const abrirModalExcluir = (saida) => {
    setSaidaSelecionada(saida);
    setModalExcluirAberto(true);
  };

  const fecharModalExcluir = () => {
    setSaidaSelecionada(null);
    setModalExcluirAberto(false);
  };

  const fecharModalErro = () => {
    setModalErroAberto(false);
    setMensagensErro([]);
  };

  const excluirSaida = async () => {
    if (!saidaSelecionada) return;

    try {
      await axios.delete(`/saidas_Medicamento/${saidaSelecionada.id}`);

      const novaLista = saidas.filter(
        (item) => item.id !== saidaSelecionada.id
      );

      setSaidas(novaLista);
      setModalExcluirAberto(false);
      setSaidaSelecionada(null);

      setMensagemSucesso('Saída excluída com sucesso!');
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
        msgs = ['Erro ao excluir saída de medicamento.'];
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
                <h2 className="titulo-principal mb-1">Saídas de Medicamentos</h2>
                <p className="text-muted mb-0">
                  Visualize, filtre e exclua os lançamentos de saída do estoque.
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

                  <div className="col-md-5">
                    <label className="form-label">Buscar por medicamento, equino, origem ou observação</label>
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

                  <div className="col-md-2">
                    <label className="form-label">Data da Saída</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dataFiltro}
                      onChange={(e) => setDataFiltro(e.target.value)}
                    />
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Tipo de Saída</label>
                    <select
                      className="form-select"
                      value={tipoFiltro}
                      onChange={(e) => setTipoFiltro(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="ATENDIMENTO">Atendimento</option>
                      <option value="VERMIFUGACAO">Vermifugação</option>
                      <option value="VACINACAO">Vacinação</option>
                    </select>
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
                      {saidasFiltradas.length}
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
                        <th>Tipo</th>
                        <th>Equino</th>
                        <th>Quantidade</th>
                        <th>Origem</th>
                        <th>Data Saída</th>
                        <th>Observação</th>
                        <th className="text-center pe-3">Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {saidasPaginadas.length > 0 ? (
                        saidasPaginadas.map((saida) => (
                          <tr key={saida.id}>
                            <td className="ps-3">
                              <div className="fw-semibold">{saida.medicamentoNome || '-'}</div>
                              <small className="text-muted">
                                Fabricante: {saida.fabricante || '-'}
                              </small>
                            </td>

                            <td>{formatarTipoSaida(saida.tipoSaida)}</td>
                            <td>{saida.equinoNome || '-'}</td>

                            <td>
                              {saida.quantidadeInformada ?? '-'} {saida.unidadeInformada || ''}
                            </td>

                            <td>{formatarOrigem(saida)}</td>
                            <td>{formatarData(saida.dataSaida)}</td>
                            <td>{saida.observacao || '-'}</td>

                            <td className="text-center pe-3">
                              <div className="d-flex justify-content-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  title="Excluir saída"
                                  onClick={() => abrirModalExcluir(saida)}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4 text-muted">
                            Nenhuma saída encontrada.
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
                <h2 className="mensagem-azul">Deseja excluir esta saída?</h2>
                <p className="mt-2">
                  {saidaSelecionada?.medicamentoNome || ''} - {saidaSelecionada?.nomeEquino || ''}
                </p>

                <div className="modalButtons mt-3">
                  <button
                    onClick={excluirSaida}
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

export default VeterinariaSaidaMedicamentoList;
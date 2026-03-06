import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import Modal from 'react-modal';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import "../../../index.css";
import './Veterinaria.css';

Modal.setAppElement('#root');

const ITENS_POR_PAGINA = 8;

const VeterinariaMedicamentoList = () => {
  const navigate = useNavigate();

  const [medicamentos, setMedicamentos] = useState([]);
  const [entradasMedicamento, setEntradasMedicamento] = useState([]);
  const [saidasMedicamento, setSaidasMedicamento] = useState([]);

  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState(null);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [modalErroAberto, setModalErroAberto] = useState(false);

  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagensErro, setMensagensErro] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [medicamentosResponse, entradasResponse, saidasResponse] = await Promise.all([
        axios.get('/medicamentos'),
        axios.get('/entradasMedicamento'),
        axios.get('/saidasMedicamento')
      ]);

      setMedicamentos(Array.isArray(medicamentosResponse.data) ? medicamentosResponse.data : []);
      setEntradasMedicamento(Array.isArray(entradasResponse.data) ? entradasResponse.data : []);
      setSaidasMedicamento(Array.isArray(saidasResponse.data) ? saidasResponse.data : []);
    } catch (error) {
      setMensagensErro(['Erro ao carregar dados dos medicamentos.']);
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

  const calcularEstoqueAtual = (medicamentoId) => {
    const totalEntradas = entradasMedicamento
      .filter((entrada) => String(entrada.medicamentoId) === String(medicamentoId))
      .reduce((acc, item) => acc + Number(item.quantidadeBase || 0), 0);

    const totalSaidas = saidasMedicamento
      .filter((saida) => String(saida.medicamentoId) === String(medicamentoId))
      .reduce((acc, item) => acc + Number(item.quantidadeBase || 0), 0);

    return totalEntradas - totalSaidas;
  };

  const medicamentosFiltrados = useMemo(() => {
    const buscaNormalizada = normalizar(busca);

    return medicamentos.filter((med) => {
      const nome = normalizar(med.nome);
      const nomeComercial = normalizar(med.nomeComercial);
      const fabricante = normalizar(med.fabricante);
      const categoria = med.categoria || '';

      const atendeBusca =
        !buscaNormalizada ||
        nome.includes(buscaNormalizada) ||
        nomeComercial.includes(buscaNormalizada) ||
        fabricante.includes(buscaNormalizada);

      const atendeCategoria =
        !categoriaFiltro || categoria === categoriaFiltro;

      return atendeBusca && atendeCategoria;
    });
  }, [medicamentos, busca, categoriaFiltro]);

  const totalPaginas = Math.ceil(medicamentosFiltrados.length / ITENS_POR_PAGINA) || 1;

  const medicamentosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return medicamentosFiltrados.slice(inicio, fim);
  }, [medicamentosFiltrados, paginaAtual]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, categoriaFiltro]);

  const abrirModalExcluir = (medicamento) => {
    setMedicamentoSelecionado(medicamento);
    setModalExcluirAberto(true);
  };

  const fecharModalExcluir = () => {
    setMedicamentoSelecionado(null);
    setModalExcluirAberto(false);
  };

  const fecharModalErro = () => {
    setModalErroAberto(false);
    setMensagensErro([]);
  };

  const excluirMedicamento = async () => {
    if (!medicamentoSelecionado) return;

    try {
      await axios.delete(`/medicamentos/${medicamentoSelecionado.id}`);

      const novaLista = medicamentos.filter(
        (med) => med.id !== medicamentoSelecionado.id
      );

      setMedicamentos(novaLista);
      setModalExcluirAberto(false);
      setMedicamentoSelecionado(null);

      setMensagemSucesso('Medicamento excluído com sucesso!');
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
        msgs = ['Erro ao excluir medicamento.'];
      }

      setMensagensErro(msgs.map(String));
      setModalErroAberto(true);
      setModalExcluirAberto(false);
    }
  };

  const limparFiltros = () => {
    setBusca('');
    setCategoriaFiltro('');
    setPaginaAtual(1);
  };

  const irParaCadastro = () => {
    navigate('/medicamentoForm');
  };

  const editarMedicamento = (id) => {
    navigate(`/medicamentoForm/${id}`);
  };

  const lancarEntrada = (id) => {
    navigate(`/medicamentoEntradaForm/${id}`);
  };

  const formatarCategoria = (categoria) => {
    const mapa = {
      ANTIBIOTICO: 'Antibiótico',
      ANTIINFLAMATORIO: 'Anti-inflamatório',
      ANALGESICO: 'Analgésico',
      ANTIPARASITARIO: 'Antiparasitário',
      SEDATIVO: 'Sedativo',
      OUTROS: 'Outros',
    };
    return mapa[categoria] || categoria || '-';
  };

  const formatarForma = (forma) => {
    const mapa = {
      SOLUCAO: 'Solução',
      COMPRIMIDO: 'Comprimido',
      PO: 'Pó',
      PASTA: 'Pasta',
      POMADA: 'Pomada',
      SPRAY: 'Spray',
      OUTROS: 'Outros',
    };
    return mapa[forma] || forma || '-';
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-12 mt-5">

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-5 mb-4">
              <div>
                <h2 className="titulo-principal mb-1">Lista de Medicamentos</h2>
                <p className="text-muted mb-0">
                  Gerencie o cadastro mestre dos medicamentos e acompanhe o estoque atual.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={irParaCadastro}
              >
                + Novo Medicamento
              </button>
            </div>

            {/* Filtros */}
            <div className="card shadow-sm border-0 rounded-4 mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-end">

                  <div className="col-md-5">
                    <label className="form-label">Buscar por nome, nome comercial ou fabricante</label>
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
                    <label className="form-label">Categoria</label>
                    <select
                      className="form-select"
                      value={categoriaFiltro}
                      onChange={(e) => setCategoriaFiltro(e.target.value)}
                    >
                      <option value="">Todas</option>
                      <option value="ANTIBIOTICO">Antibiótico</option>
                      <option value="ANTIINFLAMATORIO">Anti-inflamatório</option>
                      <option value="ANALGESICO">Analgésico</option>
                      <option value="ANTIPARASITARIO">Antiparasitário</option>
                      <option value="SEDATIVO">Sedativo</option>
                      <option value="OUTROS">Outros</option>
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

                  <div className="col-md-2 text-md-end">
                    <div className="fw-semibold">
                      Total: {medicamentosFiltrados.length}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Tabela */}
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Nome</th>
                        <th>Fabricante</th>
                        <th>Categoria</th>
                        <th>Forma</th>
                        <th>Unidade Padrão</th>
                        <th>Unidade Base</th>
                        <th>Qtde Estoque</th>
                        <th>Status</th>
                        <th className="text-center pe-3">Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {medicamentosPaginados.length > 0 ? (
                        medicamentosPaginados.map((med) => (
                          <tr key={med.id}>
                            <td className="ps-3">
                              <div className="fw-semibold">{med.nome || '-'}</div>
                              <small className="text-muted">{med.nomeComercial || '-'}</small>
                            </td>

                            <td>{med.fabricante || '-'}</td>
                            <td>{formatarCategoria(med.categoria)}</td>
                            <td>{formatarForma(med.forma)}</td>
                            <td>{med.unidadePadrao || '-'}</td>
                            <td>{med.unidadeBase || '-'}</td>

                            <td>
                              <span className="fw-semibold">
                                {calcularEstoqueAtual(med.id)} {med.unidadeBase || ''}
                              </span>
                            </td>

                            <td>
                              <span className={`badge ${med.ativo ? 'bg-success' : 'bg-secondary'}`}>
                                {med.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>

                            <td className="text-center pe-3">
                              <div className="d-flex justify-content-center gap-2 flex-wrap">

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  title="Lançar entrada"
                                  onClick={() => lancarEntrada(med.id)}
                                >
                                  <FaPlus className="me-1" />
                                  Entrada
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-warning"
                                  title="Editar medicamento"
                                  onClick={() => editarMedicamento(med.id)}
                                >
                                  <FaEdit />
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  title="Excluir medicamento"
                                  onClick={() => abrirModalExcluir(med)}
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
                            Nenhum medicamento encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Paginação */}
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

            {/* Modal excluir */}
            <Modal
              isOpen={modalExcluirAberto}
              onRequestClose={fecharModalExcluir}
              className="modal"
              overlayClassName="overlay"
            >
              <div className="modalContent text-center">
                <FaExclamationTriangle className="icone-interrogacao" />
                <h2 className="mensagem-azul">Deseja excluir este medicamento?</h2>
                <p className="mt-2">
                  {medicamentoSelecionado?.nome || ''}{' '}
                  {medicamentoSelecionado?.fabricante ? `- ${medicamentoSelecionado.fabricante}` : ''}
                </p>

                <div className="modalButtons mt-3">
                  <button
                    onClick={excluirMedicamento}
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

            {/* Modal sucesso */}
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

            {/* Modal erro */}
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

export default VeterinariaMedicamentoList;
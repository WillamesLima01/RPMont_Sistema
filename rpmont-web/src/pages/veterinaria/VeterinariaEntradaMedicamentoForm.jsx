import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api';
import Modal from 'react-modal';
import { FaCheckCircle, FaExclamationTriangle, FaQuestionCircle } from 'react-icons/fa';
import "../../../index.css";
import './Veterinaria.css';

Modal.setAppElement('#root');

const UNIDADES_POR_TIPO = {
  MASSA: ['MG', 'G', 'KG'],
  VOLUME: ['ML', 'L'],
  UNIDADE: ['UN'],
};

const BASE_POR_TIPO = {
  MASSA: 'MG',
  VOLUME: 'ML',
  UNIDADE: 'UN',
};

const converterParaBase = ({ tipoUnidade, quantidade, unidade }) => {
  const q = Number(quantidade);
  if (Number.isNaN(q) || q <= 0) return null;

  if (tipoUnidade === 'MASSA') {
    if (unidade === 'MG') return q;
    if (unidade === 'G') return q * 1000;
    if (unidade === 'KG') return q * 1000000;
  }

  if (tipoUnidade === 'VOLUME') {
    if (unidade === 'ML') return q;
    if (unidade === 'L') return q * 1000;
  }

  if (tipoUnidade === 'UNIDADE') {
    if (unidade === 'UN') return q;
  }

  return null;
};

const VeterinariaEntradaMedicamentoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id do medicamento vindo da lista

  const [entrada, setEntrada] = useState({
    medicamentoId: '',
    lote: '',
    validade: '',
    quantidadeInformada: '',
    unidadeInformada: '',
    quantidadeBase: '',
    dataEntrada: '',
    fornecedor: '',
    valorUnitario: '',
    observacao: ''
  });

  const [medicamentos, setMedicamentos] = useState([]);
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState(null);

  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErroAberto, setModalErroAberto] = useState(false);
  const [mensagensErro, setMensagensErro] = useState([]);
  const [tooltipAberto, setTooltipAberto] = useState(false);

  // carrega lista de medicamentos
  useEffect(() => {
    axios.get('/medicamentos')
      .then((response) => {
        setMedicamentos(response.data || []);
      })
      .catch(() => {
        setMensagensErro(['Erro ao carregar os medicamentos.']);
        setModalErroAberto(true);
      });
  }, []);

  // carrega o medicamento selecionado a partir do id da rota
  useEffect(() => {
    if (id) {
      axios.get(`/medicamentos/${id}`)
        .then((response) => {
          const med = response.data;

          setMedicamentoSelecionado(med);

          setEntrada((prev) => ({
            ...prev,
            medicamentoId: med.id ?? '',
            unidadeInformada: med.unidadePadrao ?? '',
            dataEntrada: prev.dataEntrada || new Date().toISOString().slice(0, 10)
          }));
        })
        .catch(() => {
          setMensagensErro(['Erro ao buscar medicamento selecionado.']);
          setModalErroAberto(true);
        });
    }
  }, [id]);

  // caso o usuário troque o medicamento manualmente (quando a tela não vier da lista)
  useEffect(() => {
    const selecionado = medicamentos.find(
      (m) => String(m.id) === String(entrada.medicamentoId)
    );

    if (selecionado) {
      setMedicamentoSelecionado(selecionado);

      setEntrada((prev) => ({
        ...prev,
        unidadeInformada: prev.unidadeInformada || selecionado.unidadePadrao || ''
      }));
    }
  }, [entrada.medicamentoId, medicamentos]);

  const unidadesDisponiveis = useMemo(() => {
    if (!medicamentoSelecionado?.tipoUnidade) return [];
    return UNIDADES_POR_TIPO[medicamentoSelecionado.tipoUnidade] ?? [];
  }, [medicamentoSelecionado]);

  const quantidadeBaseCalculada = useMemo(() => {
    if (
      !medicamentoSelecionado?.tipoUnidade ||
      !entrada.quantidadeInformada ||
      !entrada.unidadeInformada
    ) {
      return null;
    }

    return converterParaBase({
      tipoUnidade: medicamentoSelecionado.tipoUnidade,
      quantidade: entrada.quantidadeInformada,
      unidade: entrada.unidadeInformada
    });
  }, [medicamentoSelecionado, entrada.quantidadeInformada, entrada.unidadeInformada]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEntrada((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    const erros = [];

    if (!entrada.medicamentoId) erros.push('Selecione um medicamento.');
    if (!entrada.lote.trim()) erros.push('O lote é obrigatório.');
    if (!entrada.validade) erros.push('A validade é obrigatória.');
    if (!entrada.quantidadeInformada) erros.push('A quantidade é obrigatória.');
    if (!entrada.unidadeInformada) erros.push('A unidade informada é obrigatória.');
    if (!entrada.dataEntrada) erros.push('A data de entrada é obrigatória.');

    const quantidade = Number(entrada.quantidadeInformada);
    if (Number.isNaN(quantidade) || quantidade <= 0) {
      erros.push('A quantidade deve ser maior que zero.');
    }

    if (quantidadeBaseCalculada === null) {
      erros.push('Não foi possível converter a quantidade para a unidade base.');
    }

    return erros;
  };

  const resetForm = () => {
    setEntrada({
      medicamentoId: id || '',
      lote: '',
      validade: '',
      quantidadeInformada: '',
      unidadeInformada: medicamentoSelecionado?.unidadePadrao || '',
      quantidadeBase: '',
      dataEntrada: new Date().toISOString().slice(0, 10),
      fornecedor: '',
      valorUnitario: '',
      observacao: ''
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagensErro([]);

    const erros = validarFormulario();

    if (erros.length > 0) {
      setMensagensErro(erros);
      setModalErroAberto(true);
      return;
    }

    const payload = {
      ...entrada,
      medicamentoId: entrada.medicamentoId,
      quantidadeInformada: Number(entrada.quantidadeInformada),
      quantidadeBase: quantidadeBaseCalculada,
      valorUnitario: entrada.valorUnitario ? Number(entrada.valorUnitario) : null,
      medicamentoNome: medicamentoSelecionado?.nome ?? '',
      fabricante: medicamentoSelecionado?.fabricante ?? '',
      tipoUnidade: medicamentoSelecionado?.tipoUnidade ?? '',
      unidadeBase:
        medicamentoSelecionado?.unidadeBase ??
        BASE_POR_TIPO[medicamentoSelecionado?.tipoUnidade] ??
        ''
    };

    try {
      await axios.post('/entradasMedicamento', payload);

      document.activeElement?.blur?.();
      setModalConfirmacao(true);
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
        msgs = ['Erro ao salvar entrada de medicamento.'];
      }

      setMensagensErro(msgs.map(String));
      setModalErroAberto(true);
    }
  };

  const toggleTooltip = () => setTooltipAberto(!tooltipAberto);

  const fecharModalErro = () => {
    setModalErroAberto(false);
  };

  const adicionarOutraEntrada = () => {
    setModalConfirmacao(false);
    resetForm();
  };

  const finalizarCadastro = () => {
    setModalConfirmacao(false);
    setModalSucesso(true);

    setTimeout(() => {
      setModalSucesso(false);
      navigate('/medicamentoList');
    }, 2500);
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-10 mt-5">

            <div className="text-center position-relative mt-5">
              <h2 className="titulo-principal justify-content-center mt-5">
                {medicamentoSelecionado
                  ? `Lançar Entrada - ${medicamentoSelecionado.nome}`
                  : 'Lançar Entrada de Medicamento'}
                <div className="tooltip-wrapper">
                  <FaQuestionCircle className="tooltip-icon ms-2" onClick={toggleTooltip} />
                  {tooltipAberto && (
                    <div className="tooltip-mensagem">
                      Aqui você registra a entrada de estoque de um medicamento já cadastrado, com lote, validade e quantidade.
                    </div>
                  )}
                </div>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="row g-3">

              {medicamentoSelecionado && (
                <div className="col-12">
                  <div className="card shadow-sm border-0 rounded-4">
                    <div className="card-body">
                      <h5 className="mb-3">Medicamento Selecionado</h5>
                      <div className="row">
                        <div className="col-md-3">
                          <p><strong>Nome:</strong> {medicamentoSelecionado.nome}</p>
                        </div>
                        <div className="col-md-3">
                          <p><strong>Fabricante:</strong> {medicamentoSelecionado.fabricante || '-'}</p>
                        </div>
                        <div className="col-md-3">
                          <p><strong>Forma:</strong> {medicamentoSelecionado.forma || '-'}</p>
                        </div>
                        <div className="col-md-3">
                          <p><strong>Unidade Base:</strong> {medicamentoSelecionado.unidadeBase || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body">
                    <h5 className="mb-3">Dados da Entrada</h5>
                    <div className="row g-3">

                      <div className="col-md-6">
                        <label htmlFor="medicamentoId" className="form-label">Medicamento</label>
                        <select
                          id="medicamentoId"
                          name="medicamentoId"
                          className="form-select"
                          value={entrada.medicamentoId}
                          onChange={handleChange}
                          required
                          disabled={!!id}
                        >
                          <option value="">Selecione</option>
                          {medicamentos.map((med) => (
                            <option key={med.id} value={med.id}>
                              {med.nome} - {med.fabricante}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="lote" className="form-label">Lote</label>
                        <input
                          type="text"
                          id="lote"
                          name="lote"
                          className="form-control"
                          value={entrada.lote}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="validade" className="form-label">Validade</label>
                        <input
                          type="date"
                          id="validade"
                          name="validade"
                          className="form-control"
                          value={entrada.validade}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="quantidadeInformada" className="form-label">Quantidade</label>
                        <input
                          type="number"
                          step="0.01"
                          id="quantidadeInformada"
                          name="quantidadeInformada"
                          className="form-control"
                          value={entrada.quantidadeInformada}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="unidadeInformada" className="form-label">Unidade Informada</label>
                        <select
                          id="unidadeInformada"
                          name="unidadeInformada"
                          className="form-select"
                          value={entrada.unidadeInformada}
                          onChange={handleChange}
                          required
                          disabled={!medicamentoSelecionado}
                        >
                          <option value="">Selecione</option>
                          {unidadesDisponiveis.map((unidade) => (
                            <option key={unidade} value={unidade}>
                              {unidade}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="dataEntrada" className="form-label">Data da Entrada</label>
                        <input
                          type="date"
                          id="dataEntrada"
                          name="dataEntrada"
                          className="form-control"
                          value={entrada.dataEntrada}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="fornecedor" className="form-label">Fornecedor</label>
                        <input
                          type="text"
                          id="fornecedor"
                          name="fornecedor"
                          className="form-control"
                          value={entrada.fornecedor}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="valorUnitario" className="form-label">Valor Unitário</label>
                        <input
                          type="number"
                          step="0.01"
                          id="valorUnitario"
                          name="valorUnitario"
                          className="form-control"
                          value={entrada.valorUnitario}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-12">
                        <label htmlFor="observacao" className="form-label">Observações</label>
                        <textarea
                          id="observacao"
                          name="observacao"
                          rows="3"
                          className="form-control"
                          value={entrada.observacao}
                          onChange={handleChange}
                        />
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {medicamentoSelecionado && (
                <div className="col-12">
                  <div className="card shadow-sm border-0 rounded-4">
                    <div className="card-body">
                      <h5 className="mb-3">Resumo da Conversão</h5>
                      <div className="row">
                        <div className="col-md-4">
                          <p><strong>Medicamento:</strong> {medicamentoSelecionado.nome}</p>
                        </div>
                        <div className="col-md-4">
                          <p><strong>Fabricante:</strong> {medicamentoSelecionado.fabricante}</p>
                        </div>
                        <div className="col-md-4">
                          <p><strong>Unidade Base:</strong> {medicamentoSelecionado.unidadeBase}</p>
                        </div>
                        <div className="col-md-12">
                          <p className="mb-0">
                            <strong>Quantidade convertida para base:</strong>{' '}
                            {quantidadeBaseCalculada !== null
                              ? `${quantidadeBaseCalculada} ${medicamentoSelecionado.unidadeBase}`
                              : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-12 text-end mt-4">
                <Link to="/medicamentoList" className="btn btn-outline-danger me-2">
                  Cancelar
                </Link>
                <button type="submit" className="btn btn-primary">
                  Lançar Entrada
                </button>
              </div>

            </form>

            <Modal
              isOpen={modalConfirmacao}
              onRequestClose={() => setModalConfirmacao(false)}
              className="modal"
              overlayClassName="overlay"
            >
              <div className="modalContent text-center">
                <FaExclamationTriangle className="icone-interrogacao" />
                <h2 className="mensagem-azul">Deseja lançar outra entrada?</h2>
                <div className="modalButtons mt-3">
                  <button onClick={adicionarOutraEntrada} className="btn btn-confirmar me-2">
                    Sim
                  </button>
                  <button onClick={finalizarCadastro} className="btn btn-cancelar">
                    Não
                  </button>
                </div>
              </div>
            </Modal>

            <Modal
              isOpen={modalSucesso}
              className="modal"
              overlayClassName="overlay"
            >
              <div className="modalContent text-center">
                <FaCheckCircle className="icone-sucesso" />
                <h2 className="mensagem-azul">Entrada lançada com sucesso!</h2>
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
                <button onClick={fecharModalErro} className="btn btn-outline-secondary mt-3">
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

export default VeterinariaEntradaMedicamentoForm;
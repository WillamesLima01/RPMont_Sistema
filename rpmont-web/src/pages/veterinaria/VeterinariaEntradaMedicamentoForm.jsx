import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api';
import Modal from 'react-modal';
import { FaCheckCircle, FaExclamationTriangle, FaQuestionCircle } from 'react-icons/fa';
import "../../../index.css";
import './Veterinaria.css';

Modal.setAppElement('#root');

const formatarDataInput = (data) => {
  if (!data) return '';
  return String(data).slice(0, 10);
};

const VeterinariaEntradaMedicamentoForm = () => {
  const navigate = useNavigate();
  const { medicamentoId, entradaId } = useParams();

  const [entrada, setEntrada] = useState({
    medicamentoId: '',
    lote: '',
    validade: '',
    quantidadeApresentacoes: '',
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

  useEffect(() => {
    axios.get('/medicamentos')
      .then((response) => {
        setMedicamentos(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        setMensagensErro(['Erro ao carregar os medicamentos.']);
        setModalErroAberto(true);
      });
  }, []);

  useEffect(() => {
    if (medicamentoId && !entradaId) {
      axios.get(`/medicamentos/${medicamentoId}`)
        .then((response) => {
          const med = response.data;

          setMedicamentoSelecionado(med);

          setEntrada((prev) => ({
            ...prev,
            medicamentoId: med.id ?? '',
            dataEntrada: prev.dataEntrada || new Date().toISOString().slice(0, 10)
          }));
        })
        .catch(() => {
          setMensagensErro(['Erro ao buscar medicamento selecionado.']);
          setModalErroAberto(true);
        });
    }
  }, [medicamentoId, entradaId]);

  useEffect(() => {
    if (entradaId) {
      axios.get(`/entradas_medicamento/${entradaId}`)
        .then((response) => {
          const d = response.data;

          setEntrada({
            medicamentoId: d.medicamentoId ?? '',
            lote: d.lote ?? '',
            validade: formatarDataInput(d.validade),
            quantidadeApresentacoes: d.quantidadeApresentacoes ?? '',
            quantidadeBase: d.quantidadeBase ?? '',
            dataEntrada: formatarDataInput(d.dataEntrada),
            fornecedor: d.fornecedor ?? '',
            valorUnitario: d.valorUnitario ?? '',
            observacao: d.observacao ?? ''
          });

          return axios.get(`/medicamentos/${d.medicamentoId}`);
        })
        .then((medResponse) => {
          if (medResponse?.data) {
            setMedicamentoSelecionado(medResponse.data);
          }
        })
        .catch(() => {
          setMensagensErro(['Erro ao buscar entrada de medicamento.']);
          setModalErroAberto(true);
        });
    }
  }, [entradaId]);

  useEffect(() => {
    if (!entrada.medicamentoId || medicamentos.length === 0) return;

    const selecionado = medicamentos.find(
      (m) => String(m.id) === String(entrada.medicamentoId)
    );

    if (selecionado) {
      setMedicamentoSelecionado(selecionado);
    }
  }, [entrada.medicamentoId, medicamentos]);

  const quantidadeBaseCalculada = useMemo(() => {
    const quantidadeApresentacoes = Number(entrada.quantidadeApresentacoes);
    const quantidadePorApresentacao = Number(medicamentoSelecionado?.quantidadePorApresentacao);

    if (
      Number.isNaN(quantidadeApresentacoes) ||
      quantidadeApresentacoes <= 0 ||
      Number.isNaN(quantidadePorApresentacao) ||
      quantidadePorApresentacao <= 0
    ) {
      return null;
    }

    return quantidadeApresentacoes * quantidadePorApresentacao;
  }, [entrada.quantidadeApresentacoes, medicamentoSelecionado]);

  const valorTotalCalculado = useMemo(() => {
    const quantidadeApresentacoes = Number(entrada.quantidadeApresentacoes);
    const valorUnitario = Number(entrada.valorUnitario);

    if (
      Number.isNaN(quantidadeApresentacoes) ||
      quantidadeApresentacoes <= 0 ||
      Number.isNaN(valorUnitario) ||
      valorUnitario <= 0
    ) {
      return null;
    }

    return quantidadeApresentacoes * valorUnitario;
  }, [entrada.quantidadeApresentacoes, entrada.valorUnitario]);

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
    if (!entrada.quantidadeApresentacoes) erros.push('A quantidade de apresentações é obrigatória.');
    if (!entrada.dataEntrada) erros.push('A data de entrada é obrigatória.');
    if (!entrada.fornecedor.trim()) erros.push('O fornecedor é obrigatório.');
    if (!entrada.valorUnitario) erros.push('O valor unitário é obrigatório.');
  
    const quantidade = Number(entrada.quantidadeApresentacoes);
    if (Number.isNaN(quantidade) || quantidade <= 0) {
      erros.push('A quantidade de apresentações deve ser maior que zero.');
    }
  
    const valorUnitario = Number(entrada.valorUnitario);
    if (Number.isNaN(valorUnitario) || valorUnitario <= 0) {
      erros.push('O valor unitário deve ser maior que zero.');
    }
  
    if (!medicamentoSelecionado) {
      erros.push('Não foi possível carregar os dados do medicamento.');
    }
  
    if (quantidadeBaseCalculada === null) {
      erros.push('Não foi possível calcular a quantidade base da entrada.');
    }
  
    return erros;
  };

  const resetForm = () => {
    setEntrada({
      medicamentoId: medicamentoId || '',
      lote: '',
      validade: '',
      quantidadeApresentacoes: '',
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
      medicamentoId: Number(entrada.medicamentoId),
      lote: entrada.lote.trim(),
      validade: entrada.validade,
      quantidadeApresentacoes: Number(entrada.quantidadeApresentacoes),
      dataEntrada: entrada.dataEntrada,
      fornecedor: entrada.fornecedor.trim(),
      valorUnitario: Number(entrada.valorUnitario),
      observacao: entrada.observacao?.trim() || ''
    };

    try {
      if (entradaId) {
        await axios.put(`/entradas_medicamento/${entradaId}`, payload);
      } else {
        await axios.post('/entradas_medicamento', payload);
      }

      document.activeElement?.blur?.();

      if (entradaId) {
        setModalSucesso(true);
        setTimeout(() => {
          setModalSucesso(false);
          navigate('/entradaMedicamentoList');
        }, 2500);
      } else {
        setModalConfirmacao(true);
      }
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
                {entradaId
                  ? 'Editar Entrada de Medicamento'
                  : medicamentoSelecionado
                    ? `Lançar Entrada - ${medicamentoSelecionado.nome}`
                    : 'Lançar Entrada de Medicamento'}
                <div className="tooltip-wrapper">
                  <FaQuestionCircle className="tooltip-icon ms-2" onClick={toggleTooltip} />
                  {tooltipAberto && (
                    <div className="tooltip-mensagem">
                      Aqui você registra a entrada de estoque com base na apresentação do medicamento. O sistema calcula automaticamente a quantidade total em unidade base.
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
                          <p><strong>Tipo de Apresentação:</strong> {medicamentoSelecionado.tipoApresentacao || '-'}</p>
                        </div>
                        <div className="col-md-4">
                          <p>
                            <strong>Conteúdo por Apresentação:</strong>{' '}
                            {medicamentoSelecionado.quantidadePorApresentacao
                              ? `${medicamentoSelecionado.quantidadePorApresentacao} ${medicamentoSelecionado.unidadeConteudo || ''}`
                              : '-'}
                          </p>
                        </div>
                        <div className="col-md-4">
                          <p><strong>Unidade Base:</strong> {medicamentoSelecionado.unidadeBase || '-'}</p>
                        </div>
                        <div className="col-md-4">
                          <p><strong>Tipo de Unidade:</strong> {medicamentoSelecionado.tipoUnidadeEnum || '-'}</p>
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
                          disabled={!!medicamentoId || !!entradaId}
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
                        <label htmlFor="quantidadeApresentacoes" className="form-label">
                          Quantidade de Apresentações
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          id="quantidadeApresentacoes"
                          name="quantidadeApresentacoes"
                          className="form-control"
                          value={entrada.quantidadeApresentacoes}
                          onChange={handleChange}
                          required
                          placeholder="Ex.: 6"
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Apresentação</label>
                        <input
                          type="text"
                          className="form-control"
                          value={medicamentoSelecionado?.tipoApresentacao || ''}
                          disabled
                          placeholder="Selecionado automaticamente"
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Conteúdo por Apresentação</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            medicamentoSelecionado?.quantidadePorApresentacao
                              ? `${medicamentoSelecionado.quantidadePorApresentacao} ${medicamentoSelecionado?.unidadeConteudo || ''}`
                              : ''
                          }
                          disabled
                          placeholder="Calculado pelo cadastro"
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Quantidade Base Total</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            quantidadeBaseCalculada !== null
                              ? `${quantidadeBaseCalculada} ${medicamentoSelecionado?.unidadeBase || ''}`
                              : ''
                          }
                          disabled
                          placeholder="Calculada automaticamente"
                        />
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

                      <div className="col-md-4">
                        <label htmlFor="fornecedor" className="form-label">Fornecedor</label>
                        <input
                          type="text"
                          id="fornecedor"
                          name="fornecedor"
                          className="form-control"
                          value={entrada.fornecedor}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="valorUnitario" className="form-label">
                          Valor Unitário por Apresentação
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          id="valorUnitario"
                          name="valorUnitario"
                          className="form-control"
                          value={entrada.valorUnitario}
                          onChange={handleChange}
                          placeholder="Ex.: 25.90"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Valor Total</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            valorTotalCalculado !== null
                              ? `R$ ${valorTotalCalculado.toFixed(2)}`
                              : ''
                          }
                          disabled
                          placeholder="Calculado automaticamente"
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
                      <h5 className="mb-3">Resumo da Entrada</h5>
                      <div className="row">
                        <div className="col-md-4">
                          <p><strong>Medicamento:</strong> {medicamentoSelecionado.nome}</p>
                        </div>
                        <div className="col-md-4">
                          <p><strong>Fabricante:</strong> {medicamentoSelecionado.fabricante || '-'}</p>
                        </div>
                        <div className="col-md-4">
                          <p><strong>Apresentação:</strong> {medicamentoSelecionado.tipoApresentacao || '-'}</p>
                        </div>
                        <div className="col-md-12">
                          <p className="mb-0">
                            <strong>Resumo:</strong>{' '}
                            {quantidadeBaseCalculada !== null
                              ? `${entrada.quantidadeApresentacoes || 0} ${medicamentoSelecionado.tipoApresentacao || 'APRESENTAÇÃO'}(S) equivalem a ${quantidadeBaseCalculada} ${medicamentoSelecionado.unidadeBase || ''}.`
                              : 'Informe a quantidade de apresentações para calcular a entrada em unidade base.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-12 text-end mt-4">
                <Link to={entradaId ? "/entradaMedicamentoList" : "/medicamentoList"} className="btn btn-outline-danger me-2">
                  Cancelar
                </Link>
                <button type="submit" className="btn btn-primary">
                  {entradaId ? 'Salvar Alterações' : 'Lançar Entrada'}
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
                <h2 className="mensagem-azul">
                  {entradaId ? 'Entrada editada com sucesso!' : 'Entrada lançada com sucesso!'}
                </h2>
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
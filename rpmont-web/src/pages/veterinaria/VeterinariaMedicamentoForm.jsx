import React, { useEffect, useState } from 'react';
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

const VeterinariaMedicamentoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [medicamento, setMedicamento] = useState({
    nome: '',
    nomeComercial: '',
    fabricante: '',
    categoria: '',
    forma: '',
    observacao: '',
    tipoUnidade: '',
    unidadePadrao: '',
    unidadeBase: '',
    concentracaoAtiva: false,
    mgPorMl: '',
    mgPorUn: '',
    ativo: true
  });

  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErroAberto, setModalErroAberto] = useState(false);
  const [mensagensErro, setMensagensErro] = useState([]);
  const [tooltipAberto, setTooltipAberto] = useState(null);

  useEffect(() => {
    if (id) {
      axios.get(`/medicamentos/${id}`)
        .then((response) => {
          const d = response.data;
          setMedicamento({
            nome: d.nome ?? '',
            nomeComercial: d.nomeComercial ?? '',
            fabricante: d.fabricante ?? '',
            categoria: d.categoria ?? '',
            forma: d.forma ?? '',
            observacao: d.observacao ?? '',
            tipoUnidade: d.tipoUnidade ?? '',
            unidadePadrao: d.unidadePadrao ?? '',
            unidadeBase: d.unidadeBase ?? '',
            concentracaoAtiva: d.concentracaoAtiva ?? false,
            mgPorMl: d.mgPorMl ?? '',
            mgPorUn: d.mgPorUn ?? '',
            ativo: d.ativo ?? true
          });
        })
        .catch(() => {
          setMensagensErro(['Erro ao buscar medicamento.']);
          setModalErroAberto(true);
        });
    } else {
      resetForm();
    }
  }, [id]);

  const resetForm = () => {
    setMedicamento({
      nome: '',
      nomeComercial: '',
      fabricante: '',
      categoria: '',
      forma: '',
      observacao: '',
      tipoUnidade: '',
      unidadePadrao: '',
      unidadeBase: '',
      concentracaoAtiva: false,
      mgPorMl: '',
      mgPorUn: '',
      ativo: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setMedicamento((prev) => {
      const atualizado = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      if (name === 'tipoUnidade') {
        atualizado.unidadePadrao = '';
        atualizado.unidadeBase = BASE_POR_TIPO[value] ?? '';
        atualizado.concentracaoAtiva = false;
        atualizado.mgPorMl = '';
        atualizado.mgPorUn = '';
      }

      if (name === 'unidadePadrao' && !prev.unidadeBase) {
        atualizado.unidadeBase = BASE_POR_TIPO[prev.tipoUnidade] ?? '';
      }

      if (name === 'tipoUnidade' && value === 'MASSA') {
        atualizado.concentracaoAtiva = false;
        atualizado.mgPorMl = '';
        atualizado.mgPorUn = '';
      }

      return atualizado;
    });
  };

  const validarFormulario = () => {
    const erros = [];

    if (!medicamento.nome.trim()) erros.push('O nome do medicamento é obrigatório.');
    if (!medicamento.fabricante.trim()) erros.push('O fabricante é obrigatório.');
    if (!medicamento.categoria) erros.push('A categoria é obrigatória.');
    if (!medicamento.forma) erros.push('A forma farmacêutica é obrigatória.');
    if (!medicamento.tipoUnidade) erros.push('O tipo de unidade é obrigatório.');
    if (!medicamento.unidadePadrao) erros.push('A unidade padrão é obrigatória.');

    if (medicamento.tipoUnidade === 'VOLUME' && medicamento.concentracaoAtiva) {
      const valor = Number(medicamento.mgPorMl);
      if (Number.isNaN(valor) || valor <= 0) {
        erros.push('Informe uma concentração válida em mg/mL.');
      }
    }

    if (medicamento.tipoUnidade === 'UNIDADE' && medicamento.concentracaoAtiva) {
      const valor = Number(medicamento.mgPorUn);
      if (Number.isNaN(valor) || valor <= 0) {
        erros.push('Informe uma concentração válida em mg/UN.');
      }
    }

    return erros;
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
      ...medicamento,
      mgPorMl: medicamento.concentracaoAtiva && medicamento.tipoUnidade === 'VOLUME'
        ? Number(medicamento.mgPorMl)
        : null,
      mgPorUn: medicamento.concentracaoAtiva && medicamento.tipoUnidade === 'UNIDADE'
        ? Number(medicamento.mgPorUn)
        : null
    };

    try {
      const request = id
        ? axios.put(`/medicamentos/${id}`, payload)
        : axios.post('/medicamentos', payload);

      await request;

      document.activeElement?.blur?.();

      if (id) {
        setModalSucesso(true);
        setTimeout(() => {
          setModalSucesso(false);
          navigate('/medicamentoList');
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
        msgs = ['Erro ao salvar medicamento.'];
      }

      setMensagensErro(msgs.map(String));
      setModalErroAberto(true);
    }
  };

  const toggleTooltip = (campo) => {
    setTooltipAberto((prev) => (prev === campo ? null : campo));
  };

  const fecharModalErro = () => setModalErroAberto(false);

  const adicionarOutroMedicamento = () => {
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

  const unidadesDisponiveis = medicamento.tipoUnidade
    ? UNIDADES_POR_TIPO[medicamento.tipoUnidade]
    : [];

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-10 mt-5">

            <div className="text-center position-relative mt-5">
              <h2 className="titulo-principal justify-content-center mt-5">
                {id ? 'Editar Medicamento' : 'Cadastrar Medicamento'}
                <div className="tooltip-wrapper">
                  <FaQuestionCircle
                    className="tooltip-icon ms-2"
                    onClick={() => toggleTooltip('titulo')}
                  />
                  {tooltipAberto === 'titulo' && (
                    <div className="tooltip-mensagem">
                      {id
                        ? 'Aqui você pode editar os dados cadastrais do medicamento.'
                        : 'Aqui você cadastra apenas o medicamento. A quantidade em estoque será lançada na tela de entrada.'}
                    </div>
                  )}
                </div>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="row g-3">

              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body">
                    <h5 className="mb-3">Dados do Medicamento</h5>
                    <div className="row g-3">

                      <div className="col-md-6">
                        <label htmlFor="nome" className="form-label">Nome do Medicamento</label>
                        <input
                          type="text"
                          id="nome"
                          name="nome"
                          className="form-control"
                          value={medicamento.nome}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="nomeComercial" className="form-label">Nome Comercial</label>
                        <input
                          type="text"
                          id="nomeComercial"
                          name="nomeComercial"
                          className="form-control"
                          value={medicamento.nomeComercial}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="fabricante" className="form-label">Fabricante</label>
                        <input
                          type="text"
                          id="fabricante"
                          name="fabricante"
                          className="form-control"
                          value={medicamento.fabricante}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="categoria" className="form-label">Categoria</label>
                        <select
                          id="categoria"
                          name="categoria"
                          className="form-select"
                          value={medicamento.categoria}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="ANTIBIOTICO">Antibiótico</option>
                          <option value="ANTIINFLAMATORIO">Anti-inflamatório</option>
                          <option value="ANALGESICO">Analgésico</option>
                          <option value="ANTIPARASITARIO">Antiparasitário</option>
                          <option value="SEDATIVO">Sedativo</option>
                          <option value="OUTROS">Outros</option>
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="forma" className="form-label">Forma Farmacêutica</label>
                        <select
                          id="forma"
                          name="forma"
                          className="form-select"
                          value={medicamento.forma}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="SOLUCAO">Solução</option>
                          <option value="COMPRIMIDO">Comprimido</option>
                          <option value="PO">Pó</option>
                          <option value="PASTA">Pasta</option>
                          <option value="POMADA">Pomada</option>
                          <option value="SPRAY">Spray</option>
                          <option value="OUTROS">Outros</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label d-flex align-items-center">
                          Tipo de Unidade
                          <div className="tooltip-wrapper">
                            <FaQuestionCircle
                              className="tooltip-icon ms-2"
                              onClick={() => toggleTooltip('tipoUnidade')}
                            />
                            {tooltipAberto === 'tipoUnidade' && (
                              <div className="tooltip-mensagem">
                                Define a natureza da medida do medicamento: massa, volume ou unidade.
                              </div>
                            )}
                          </div>
                        </label>
                        <select
                          id="tipoUnidade"
                          name="tipoUnidade"
                          className="form-select"
                          value={medicamento.tipoUnidade}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="MASSA">Massa</option>
                          <option value="VOLUME">Volume</option>
                          <option value="UNIDADE">Unidade</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label d-flex align-items-center">
                          Unidade Padrão
                          <div className="tooltip-wrapper">
                            <FaQuestionCircle
                              className="tooltip-icon ms-2"
                              onClick={() => toggleTooltip('unidadePadrao')}
                            />
                            {tooltipAberto === 'unidadePadrao' && (
                              <div className="tooltip-mensagem">
                                Unidade principal em que o medicamento é cadastrado no sistema. Exemplo: UN, ML, G.
                              </div>
                            )}
                          </div>
                        </label>
                        <select
                          id="unidadePadrao"
                          name="unidadePadrao"
                          className="form-select"
                          value={medicamento.unidadePadrao}
                          onChange={handleChange}
                          required
                          disabled={!medicamento.tipoUnidade}
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
                        <label className="form-label d-flex align-items-center">
                          Unidade Base
                          <div className="tooltip-wrapper">
                            <FaQuestionCircle
                              className="tooltip-icon ms-2"
                              onClick={() => toggleTooltip('unidadeBase')}
                            />
                            {tooltipAberto === 'unidadeBase' && (
                              <div className="tooltip-mensagem">
                                Unidade usada pelo sistema para calcular estoque e consumo. Exemplo: ML para líquidos, MG para massa, UN para comprimidos.
                              </div>
                            )}
                          </div>
                        </label>
                        <input
                          type="text"
                          id="unidadeBase"
                          name="unidadeBase"
                          className="form-control"
                          value={medicamento.unidadeBase}
                          readOnly
                        />
                      </div>

                      <div className="col-md-12">
                        <div className="form-check mt-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="concentracaoAtiva"
                            name="concentracaoAtiva"
                            checked={medicamento.concentracaoAtiva}
                            onChange={handleChange}
                            disabled={!medicamento.tipoUnidade || medicamento.tipoUnidade === 'MASSA'}
                          />
                          <label className="form-check-label" htmlFor="concentracaoAtiva">
                            Informar concentração
                          </label>
                        </div>
                      </div>

                      {medicamento.concentracaoAtiva && medicamento.tipoUnidade === 'VOLUME' && (
                        <div className="col-md-6">
                          <label htmlFor="mgPorMl" className="form-label">Concentração (mg/mL)</label>
                          <input
                            type="number"
                            step="0.01"
                            id="mgPorMl"
                            name="mgPorMl"
                            className="form-control"
                            value={medicamento.mgPorMl}
                            onChange={handleChange}
                          />
                        </div>
                      )}

                      {medicamento.concentracaoAtiva && medicamento.tipoUnidade === 'UNIDADE' && (
                        <div className="col-md-6">
                          <label htmlFor="mgPorUn" className="form-label">Concentração (mg/UN)</label>
                          <input
                            type="number"
                            step="0.01"
                            id="mgPorUn"
                            name="mgPorUn"
                            className="form-control"
                            value={medicamento.mgPorUn}
                            onChange={handleChange}
                          />
                        </div>
                      )}

                      <div className="col-md-12">
                        <label htmlFor="observacao" className="form-label">Observações</label>
                        <textarea
                          id="observacao"
                          name="observacao"
                          rows="3"
                          className="form-control"
                          value={medicamento.observacao}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-3">
                        <div className="form-check mt-4">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="ativo"
                            name="ativo"
                            checked={medicamento.ativo}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="ativo">
                            Medicamento ativo
                          </label>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 text-end mt-4">
                <Link to="/medicamentoList" className="btn btn-outline-danger me-2">Cancelar</Link>
                <button type="submit" className="btn btn-primary">
                  {id ? 'Salvar' : 'Cadastrar'}
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
                <h2 className="mensagem-azul">Deseja cadastrar outro medicamento?</h2>
                <div className="modalButtons mt-3">
                  <button onClick={adicionarOutroMedicamento} className="btn btn-confirmar me-2">Sim</button>
                  <button onClick={finalizarCadastro} className="btn btn-cancelar">Não</button>
                </div>
              </div>
            </Modal>

            <Modal isOpen={modalSucesso} className="modal" overlayClassName="overlay">
              <div className="modalContent text-center">
                <FaCheckCircle className="icone-sucesso" />
                <h2 className="mensagem-azul">
                  {id ? 'Medicamento editado com sucesso!' : 'Medicamento cadastrado com sucesso!'}
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
                <button onClick={fecharModalErro} className="btn btn-outline-secondary mt-3">Fechar</button>
              </div>
            </Modal>

          </div>
        </div>
      </div>
    </>
  );
};

export default VeterinariaMedicamentoForm;
import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api';
import Modal from 'react-modal';
import { FaCheckCircle, FaExclamationTriangle, FaQuestionCircle } from 'react-icons/fa';
import "../../../index.css";
import './Veterinaria.css';

Modal.setAppElement('#root');

const TIPOS_APRESENTACAO = [
  'FRASCO',
  'AMPOLA',
  'BISNAGA',
  'CAIXA',
  'SACHÊ',
  'COMPRIMIDO',
  'CARTELA',
  'BOLSA',
  'ENVELOPE',
  'TUBO',
  'POTE',
  'SERINGA'
];

const FORMAS_FARMACEUTICAS = [
  { value: 'SOLUCAO', label: 'Solução' },
  { value: 'LIQUIDO', label: 'Líquido' },
  { value: 'INJETAVEL', label: 'Injetável' },
  { value: 'COMPRIMIDO', label: 'Comprimido' },
  { value: 'CAPSULA', label: 'Cápsula' },
  { value: 'PO', label: 'Pó' },
  { value: 'PASTA', label: 'Pasta' },
  { value: 'POMADA', label: 'Pomada' },
  { value: 'SPRAY', label: 'Spray' },
  { value: 'CREME', label: 'Creme' },
  { value: 'GEL', label: 'Gel' },
  { value: 'OUTROS', label: 'Outros' }
];

const CATEGORIAS = [
  { value: 'ANTIBIOTICO', label: 'Antibiótico' },
  { value: 'ANTIINFLAMATORIO', label: 'Anti-inflamatório' },
  { value: 'ANALGESICO', label: 'Analgésico' },
  { value: 'ANTIPARASITARIO', label: 'Antiparasitário' },
  { value: 'SEDATIVO', label: 'Sedativo' },
  { value: 'VITAMINA', label: 'Vitamina' },
  { value: 'ANESTESICO', label: 'Anestésico' },
  { value: 'CICATRIZANTE', label: 'Cicatrizante' },
  { value: 'IMUNIZACAO', label: 'Imunização' },
  { value: 'SORO', label: 'Soro' },
  { value: 'OUTROS', label: 'Outros' }
];

const UNIDADES_POR_FORMA = {
  SOLUCAO: ['ML', 'L'],
  LIQUIDO: ['ML', 'L'],
  INJETAVEL: ['ML', 'L'],
  COMPRIMIDO: ['UN'],
  CAPSULA: ['UN'],
  PO: ['MG', 'G', 'KG'],
  PASTA: ['MG', 'G', 'KG'],
  POMADA: ['MG', 'G', 'KG'],
  SPRAY: ['ML', 'L'],
  CREME: ['MG', 'G', 'KG'],
  GEL: ['MG', 'G', 'KG'],
  OUTROS: ['MG', 'G', 'KG', 'ML', 'L', 'UN']
};

const BASE_COMPATIVEL = {
  MG: ['MG'],
  G: ['MG', 'G'],
  KG: ['MG', 'G', 'KG'],
  ML: ['ML'],
  L: ['ML', 'L'],
  UN: ['UN']
};

const derivarTipoUnidade = (unidade) => {
  if (['MG', 'G', 'KG'].includes(unidade)) return 'MASSA';
  if (['ML', 'L'].includes(unidade)) return 'VOLUME';
  if (['UN'].includes(unidade)) return 'UNIDADE';
  return '';
};

const obterLabelPorValor = (lista, valor) => {
  return lista.find((item) => item.value === valor)?.label || valor || '-';
};

const VeterinariaMedicamentoForm = () => {
  const navigate = useNavigate();
  const { medicamentoId } = useParams();

  const [medicamento, setMedicamento] = useState({
    nome: '',
    nomeComercial: '',
    fabricante: '',
    categoria: '',
    forma: '',
    observacao: '',
    tipoApresentacao: '',
    quantidadePorApresentacao: '',
    unidadeConteudo: '',
    unidadeBase: '',
    ativo: true
  });

  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErroAberto, setModalErroAberto] = useState(false);
  const [mensagensErro, setMensagensErro] = useState([]);
  const [tooltipAberto, setTooltipAberto] = useState(null);

  useEffect(() => {
    if (medicamentoId) {
      axios.get(`/medicamentos/${medicamentoId}`)
        .then((response) => {
          const d = response.data;
          setMedicamento({
            nome: d.nome ?? '',
            nomeComercial: d.nomeComercial ?? '',
            fabricante: d.fabricante ?? '',
            categoria: d.categoria ?? '',
            forma: d.forma ?? '',
            observacao: d.observacao ?? '',
            tipoApresentacao: d.tipoApresentacao ?? '',
            quantidadePorApresentacao: d.quantidadePorApresentacao ?? '',
            unidadeConteudo: d.unidadeConteudo ?? '',
            unidadeBase: d.unidadeBase ?? '',
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
  }, [medicamentoId]);

  const resetForm = () => {
    setMedicamento({
      nome: '',
      nomeComercial: '',
      fabricante: '',
      categoria: '',
      forma: '',
      observacao: '',
      tipoApresentacao: '',
      quantidadePorApresentacao: '',
      unidadeConteudo: '',
      unidadeBase: '',
      ativo: true
    });
  };

  const unidadesConteudoDisponiveis = useMemo(() => {
    if (!medicamento.forma) return [];
    return UNIDADES_POR_FORMA[medicamento.forma] ?? [];
  }, [medicamento.forma]);

  const unidadesBaseDisponiveis = useMemo(() => {
    if (!medicamento.unidadeConteudo) return [];
    return BASE_COMPATIVEL[medicamento.unidadeConteudo] ?? [];
  }, [medicamento.unidadeConteudo]);

  const tipoUnidadeCalculado = useMemo(() => {
    return derivarTipoUnidade(medicamento.unidadeBase || medicamento.unidadeConteudo);
  }, [medicamento.unidadeBase, medicamento.unidadeConteudo]);

  const resumoCadastro = useMemo(() => {
    if (
      !medicamento.nome &&
      !medicamento.tipoApresentacao &&
      !medicamento.quantidadePorApresentacao &&
      !medicamento.unidadeConteudo &&
      !medicamento.unidadeBase
    ) {
      return 'Preencha os campos para visualizar como o medicamento será controlado no sistema.';
    }

    const nome = medicamento.nome || 'Medicamento';
    const apresentacao = medicamento.tipoApresentacao || 'APRESENTAÇÃO';
    const quantidade = medicamento.quantidadePorApresentacao || '0';
    const unidadeConteudo = medicamento.unidadeConteudo || 'UN';
    const unidadeBase = medicamento.unidadeBase || 'UN';

    return `${nome} será cadastrado como ${apresentacao} com ${quantidade} ${unidadeConteudo}, e o controle de estoque/consumo será feito em ${unidadeBase}.`;
  }, [medicamento]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setMedicamento((prev) => {
      const atualizado = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      if (name === 'forma') {
        atualizado.unidadeConteudo = '';
        atualizado.unidadeBase = '';
      }

      if (name === 'unidadeConteudo') {
        atualizado.unidadeBase = '';
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
    if (!medicamento.tipoApresentacao) erros.push('O tipo de apresentação é obrigatório.');
    if (!medicamento.quantidadePorApresentacao) erros.push('A quantidade por apresentação é obrigatória.');
    if (!medicamento.unidadeConteudo) erros.push('A unidade do conteúdo é obrigatória.');
    if (!medicamento.unidadeBase) erros.push('A unidade base é obrigatória.');

    const quantidade = Number(medicamento.quantidadePorApresentacao);
    if (Number.isNaN(quantidade) || quantidade <= 0) {
      erros.push('A quantidade por apresentação deve ser maior que zero.');
    }

    if (
      medicamento.unidadeConteudo &&
      medicamento.unidadeBase &&
      !(BASE_COMPATIVEL[medicamento.unidadeConteudo] || []).includes(medicamento.unidadeBase)
    ) {
      erros.push('A unidade base não é compatível com a unidade do conteúdo.');
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
      nome: medicamento.nome.trim(),
      nomeComercial: medicamento.nomeComercial.trim(),
      fabricante: medicamento.fabricante.trim(),
      categoria: medicamento.categoria,
      forma: medicamento.forma,
      observacao: medicamento.observacao.trim(),
      tipoApresentacao: medicamento.tipoApresentacao,
      quantidadePorApresentacao: Number(medicamento.quantidadePorApresentacao),
      unidadeConteudo: medicamento.unidadeConteudo,
      unidadeBase: medicamento.unidadeBase,
      tipoUnidadeEnum: tipoUnidadeCalculado,
      ativo: medicamento.ativo
    };

    try {
      const request = medicamentoId
        ? axios.put(`/medicamentos/${medicamentoId}`, payload)
        : axios.post('/medicamentos', payload);

      await request;

      document.activeElement?.blur?.();

      if (medicamentoId) {
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

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-10 mt-5">

            <div className="text-center position-relative mt-5">
              <h2 className="titulo-principal justify-content-center mt-5">
                {medicamentoId ? 'Editar Medicamento' : 'Cadastrar Medicamento'}
                <div className="tooltip-wrapper">
                  <FaQuestionCircle
                    className="tooltip-icon ms-2"
                    onClick={() => toggleTooltip('titulo')}
                  />
                  {tooltipAberto === 'titulo' && (
                    <div className="tooltip-mensagem">
                      {medicamentoId
                        ? 'Aqui você pode editar os dados do medicamento e sua apresentação comercial.'
                        : 'Aqui você cadastra o medicamento definindo como ele é comprado e como será controlado no estoque.'}
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

                      <div className="col-md-4">
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

                      <div className="col-md-4">
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
                          {CATEGORIAS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
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
                          {FORMAS_FARMACEUTICAS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-9">
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

              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body">
                    <h5 className="mb-3">Apresentação Comercial</h5>
                    <div className="row g-3">

                      <div className="col-md-4">
                        <label className="form-label d-flex align-items-center">
                          Tipo de Apresentação
                          <div className="tooltip-wrapper">
                            <FaQuestionCircle
                              className="tooltip-icon ms-2"
                              onClick={() => toggleTooltip('tipoApresentacao')}
                            />
                            {tooltipAberto === 'tipoApresentacao' && (
                              <div className="tooltip-mensagem">
                                Forma em que o produto é comprado, como frasco, ampola, bisnaga ou cartela.
                              </div>
                            )}
                          </div>
                        </label>
                        <select
                          id="tipoApresentacao"
                          name="tipoApresentacao"
                          className="form-select"
                          value={medicamento.tipoApresentacao}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Selecione</option>
                          {TIPOS_APRESENTACAO.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label d-flex align-items-center">
                          Quantidade por Apresentação
                          <div className="tooltip-wrapper">
                            <FaQuestionCircle
                              className="tooltip-icon ms-2"
                              onClick={() => toggleTooltip('quantidadePorApresentacao')}
                            />
                            {tooltipAberto === 'quantidadePorApresentacao' && (
                              <div className="tooltip-mensagem">
                                Quantidade de conteúdo que existe em cada apresentação. Exemplo: 50 em um frasco de 50 mL.
                              </div>
                            )}
                          </div>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          id="quantidadePorApresentacao"
                          name="quantidadePorApresentacao"
                          className="form-control"
                          value={medicamento.quantidadePorApresentacao}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label d-flex align-items-center">
                          Unidade do Conteúdo
                          <div className="tooltip-wrapper">
                            <FaQuestionCircle
                              className="tooltip-icon ms-2"
                              onClick={() => toggleTooltip('unidadeConteudo')}
                            />
                            {tooltipAberto === 'unidadeConteudo' && (
                              <div className="tooltip-mensagem">
                                Unidade do conteúdo que vem dentro da apresentação. Exemplo: mL, g ou UN.
                              </div>
                            )}
                          </div>
                        </label>
                        <select
                          id="unidadeConteudo"
                          name="unidadeConteudo"
                          className="form-select"
                          value={medicamento.unidadeConteudo}
                          onChange={handleChange}
                          required
                          disabled={!medicamento.forma}
                        >
                          <option value="">Selecione</option>
                          {unidadesConteudoDisponiveis.map((unidade) => (
                            <option key={unidade} value={unidade}>
                              {unidade}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body">
                    <h5 className="mb-3">Controle de Estoque</h5>
                    <div className="row g-3">

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
                                Unidade em que o sistema vai controlar o estoque e o consumo do medicamento nos atendimentos.
                              </div>
                            )}
                          </div>
                        </label>
                        <select
                          id="unidadeBase"
                          name="unidadeBase"
                          className="form-select"
                          value={medicamento.unidadeBase}
                          onChange={handleChange}
                          required
                          disabled={!medicamento.unidadeConteudo}
                        >
                          <option value="">Selecione</option>
                          {unidadesBaseDisponiveis.map((unidade) => (
                            <option key={unidade} value={unidade}>
                              {unidade}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Tipo de Unidade</label>
                        <input
                          type="text"
                          className="form-control"
                          value={tipoUnidadeCalculado}
                          readOnly
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Compatibilidade</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            medicamento.unidadeConteudo && medicamento.unidadeBase
                              ? 'Compatível'
                              : 'Aguardando seleção'
                          }
                          readOnly
                        />
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body">
                    <h5 className="mb-3">Resumo do Cadastro</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <p className="mb-2"><strong>Medicamento:</strong> {medicamento.nome || '-'}</p>
                        <p className="mb-2"><strong>Fabricante:</strong> {medicamento.fabricante || '-'}</p>
                        <p className="mb-2"><strong>Categoria:</strong> {obterLabelPorValor(CATEGORIAS, medicamento.categoria)}</p>
                        <p className="mb-0"><strong>Forma:</strong> {obterLabelPorValor(FORMAS_FARMACEUTICAS, medicamento.forma)}</p>
                      </div>

                      <div className="col-md-6">
                        <p className="mb-2"><strong>Apresentação:</strong> {medicamento.tipoApresentacao || '-'}</p>
                        <p className="mb-2">
                          <strong>Conteúdo por apresentação:</strong>{' '}
                          {medicamento.quantidadePorApresentacao
                            ? `${medicamento.quantidadePorApresentacao} ${medicamento.unidadeConteudo || ''}`
                            : '-'}
                        </p>
                        <p className="mb-2"><strong>Unidade base:</strong> {medicamento.unidadeBase || '-'}</p>
                        <p className="mb-0"><strong>Status:</strong> {medicamento.ativo ? 'Ativo' : 'Inativo'}</p>
                      </div>

                      <div className="col-12">
                        <div className="alert alert-primary mb-0">
                          <strong>Resumo:</strong> {resumoCadastro}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 text-end mt-4">
                <Link to="/medicamentoList" className="btn btn-outline-danger me-2">Cancelar</Link>
                <button type="submit" className="btn btn-primary">
                  {medicamentoId ? 'Salvar' : 'Cadastrar'}
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
                  {medicamentoId ? 'Medicamento editado com sucesso!' : 'Medicamento cadastrado com sucesso!'}
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
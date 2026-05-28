// src/pages/veterinaria/VeterinariaFerrageamentoEquinoForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Veterinaria.css';
import axios from '../../api';
import Modal from 'react-modal';
import { FaCheckCircle } from 'react-icons/fa';
import ModalGenerico from '../../components/modal/ModalGenerico.jsx';
import Navbar from '../../components/navbar/Navbar.jsx';

Modal.setAppElement('#root');

const VeterinariaFerrageamentoEquinoForm = () => {
  const { tipo, id } = useParams();
  const navigate = useNavigate();

  const [equino, setEquino] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [ferrageamentoId, setFerrageamentoId] = useState(null);

  const [ultimoFerrageamento, setUltimoFerrageamento] = useState(null);
  const [carregandoUltimoFerrageamento, setCarregandoUltimoFerrageamento] = useState(false);

  function dateOnlyToISO(dateOnlyStr) {
    if (!dateOnlyStr) return null;

    const dt = new Date(`${dateOnlyStr}T00:00:00-03:00`);
    return isNaN(dt) ? null : dt.toISOString();
  }

  const [formData, setFormData] = useState({
    equinoId: id,
    procedimento: '',
    tipoFerradura: '',
    numeroFerro: '',
    tipoCravo: '',
    tipoJustura: '',
    tipoFerrageamento: '',
    ferros: 4,
    cravos: 16,
    patas: [],
    tipoCurativo: '',
    ferroNovo: '',
    cravosUsados: 0,
    observacoes: '',
    dataProximoProcedimento: '',
  });

  const patasOptions = [
    'Anterior Esquerda',
    'Anterior Direita',
    'Posterior Esquerda',
    'Posterior Direita',
  ];

  const tamanhosFerradura = [
    '000',
    '00',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
  ];

  const tiposFerradura = ['Geral', 'Terapêutica', 'Ortopédica'];
  const tiposCravo = ['Comum', 'Rosca', 'Ortopédico'];
  const tiposJustura = ['Francesa', 'Inglesa', 'Oriental'];
  const tiposFerrageamento = ['A Quente', 'A Frio'];

  const formatarData = (data) => {
    if (!data) return 'Não informada';

    const apenasData = String(data).slice(0, 10);
    const dataConvertida = new Date(`${apenasData}T00:00:00`);

    if (Number.isNaN(dataConvertida.getTime())) return 'Não informada';

    return dataConvertida.toLocaleDateString('pt-BR');
  };

  const obterDataFerrageamento = (item) => {
    return (
      item?.data ??
      item?.dataCadastro ??
      item?.dataFerrageamento ??
      item?.criadoEm ??
      item?.createdAt ??
      null
    );
  };

  const buscarUltimoFerrageamento = async (equinoIdBusca) => {
    if (!equinoIdBusca) {
      setUltimoFerrageamento(null);
      return;
    }

    try {
      setCarregandoUltimoFerrageamento(true);

      const response = await axios.get('/ferrageamento_equino');
      const lista = response.data || [];

      const ferrageamentosDoEquino = lista
        .filter((item) => String(item.equinoId) === String(equinoIdBusca))
        .sort((a, b) => {
          const dataA = new Date(obterDataFerrageamento(a) || 0);
          const dataB = new Date(obterDataFerrageamento(b) || 0);

          if (dataB.getTime() !== dataA.getTime()) {
            return dataB - dataA;
          }

          return Number(b.id || 0) - Number(a.id || 0);
        });

      const ultimo = ferrageamentosDoEquino[0] || null;
      setUltimoFerrageamento(ultimo);

      if (ultimo?.numeroFerro) {
        setFormData((prev) => ({
          ...prev,
          numeroFerro: ultimo.numeroFerro,
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar último ferrageamento:', error);
      setUltimoFerrageamento(null);
    } finally {
      setCarregandoUltimoFerrageamento(false);
    }
  };

  useEffect(() => {
    const buscarDados = async () => {
      try {
        if (!tipo) {
          const equinoRes = await axios.get(`/equino/${id}`);

          setEquino(equinoRes.data);
          setFormData((prev) => ({
            ...prev,
            equinoId: id,
          }));

          return;
        }

        let endpoint = '';
        let procedimento = '';
        let dados = null;

        switch (tipo) {
          case 'ferrar':
            endpoint = `/ferrageamento_equino/${id}`;
            procedimento = 'Ferrar';
            break;
          case 'reprego':
            endpoint = `/ferrageamento_reprego_equino/${id}`;
            procedimento = 'Reprego';
            break;
          case 'curativo':
            endpoint = `/ferrageamento_curativo_equino/${id}`;
            procedimento = 'Curativo';
            break;
          default:
            console.error('Tipo de procedimento inválido:', tipo);
            return;
        }

        const res = await axios.get(endpoint);
        dados = res.data;

        setModoEdicao(true);
        setFerrageamentoId(dados.id);

        setFormData((prev) => {
          const base = {
            ...prev,
            procedimento,
            observacoes: dados.observacoes || '',
            equinoId: dados.equinoId || '',
          };

          if (tipo === 'ferrar') {
            return {
              ...base,
              tipoFerradura: dados.tipoFerradura || '',
              tipoCravo: dados.tipoCravo || '',
              tipoJustura: dados.tipoJustura || '',
              tipoFerrageamento: dados.tipoFerrageamento || '',
              ferros: dados.ferros ?? 4,
              cravos: dados.cravos ?? 16,
              numeroFerro: dados.numeroFerro || '',
              dataProximoProcedimento: dados.dataProximoProcedimento
                ? new Date(dados.dataProximoProcedimento).toISOString().slice(0, 10)
                : '',
            };
          }

          if (tipo === 'reprego') {
            return {
              ...base,
              patas: dados.patas || [],
              ferroNovo: dados.ferroNovo || 'Não',
              cravosUsados: dados.cravosUsados ?? 0,
              numeroFerro: dados.numeroFerro || '',
            };
          }

          if (tipo === 'curativo') {
            return {
              ...base,
              tipoCurativo: dados.tipoCurativo || '',
            };
          }

          return base;
        });

        const equinoRes = await axios.get(`/equino/${dados.equinoId}`);
        setEquino(equinoRes.data);

        if (tipo === 'reprego') {
          await buscarUltimoFerrageamento(dados.equinoId);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    buscarDados();
  }, [id, tipo]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    if (type === 'checkbox' && name === 'patas') {
      const novaLista = checked
        ? [...formData.patas, value]
        : formData.patas.filter((p) => p !== value);

      setFormData((prev) => ({
        ...prev,
        patas: novaLista,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'procedimento' && value === 'Reprego') {
      buscarUltimoFerrageamento(formData.equinoId);
    }

    if (name === 'procedimento' && value !== 'Reprego') {
      setUltimoFerrageamento(null);
    }
  };

  const quantidadeFerradurasReprego =
    formData.ferroNovo === 'Sim' ? formData.patas.length : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.procedimento === 'Ferrar') {
        const proxISO = dateOnlyToISO(formData.dataProximoProcedimento);

        const dados = {
          equinoId: formData.equinoId,
          tipoFerradura: formData.tipoFerradura,
          numeroFerro: formData.numeroFerro,
          tipoCravo: formData.tipoCravo,
          tipoJustura: formData.tipoJustura,
          tipoFerrageamento: formData.tipoFerrageamento,
          ferros: Number(formData.ferros),
          cravos: Number(formData.cravos),
          observacoes: formData.observacoes,
          dataProximoProcedimento: proxISO || undefined,
        };

        if (modoEdicao) {
          await axios.put(`/ferrageamento_equino/${ferrageamentoId}`, dados);
        } else {
          await axios.post('/ferrageamento_equino', dados);
        }
      }

      if (formData.procedimento === 'Reprego') {
        const dados = {
          equinoId: formData.equinoId,
          ferrageamentoOrigemId: ultimoFerrageamento?.id || null,
          patas: formData.patas,
          ferroNovo: formData.ferroNovo,
          numeroFerro: formData.numeroFerro || ultimoFerrageamento?.numeroFerro || '',
          quantidadeFerraduras: quantidadeFerradurasReprego,
          cravosUsados: Number(formData.cravosUsados),
          observacoes: formData.observacoes,
        };

        if (modoEdicao) {
          await axios.put(`/ferrageamento_reprego_equino/${ferrageamentoId}`, dados);
        } else {
          await axios.post('/ferrageamento_reprego_equino', dados);
        }
      }

      if (formData.procedimento === 'Curativo') {
        const dados = {
          equinoId: formData.equinoId,
          tipoCurativo: formData.tipoCurativo,
          observacoes: formData.observacoes,
        };

        if (modoEdicao) {
          await axios.put(`/ferrageamento_curativo_equino/${ferrageamentoId}`, dados);
        } else {
          await axios.post('/ferrageamento_curativo_equino', dados);
        }
      }

      setModalAberto(true);

      setTimeout(() => {
        setModalAberto(false);
        navigate('/manejo-sanitario-list');
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar os dados:', error);
      alert('Erro ao salvar.');
    }
  };

  return (
    <div className="container mt-5 pt-5">
      <Navbar />

      <h2 className="text-primary mb-4">Ferrageamento Equino</h2>

      {equino && (
        <div className="alert alert-info">
          <h5 className="mb-3 text-primary d-flex align-items-center">
            <i className="bi bi-horse me-2"></i> Dados do Equino
          </h5>

          <div className="d-flex justify-content-between flex-wrap">
            <p className="mb-1 me-4">
              <strong>Nome:</strong> {equino.nome}
            </p>

            <p className="mb-1 me-4">
              <strong>Raça:</strong> {equino.raca}
            </p>

            <p className="mb-1 me-4">
              <strong>Registro:</strong> {equino.registro}
            </p>

            <p className="mb-1 me-4">
              <strong>Pelagem:</strong> {equino.pelagem}
            </p>

            <p className="mb-1 me-4">
              <strong>Sexo:</strong> {equino.sexo}
            </p>

            <p className="mb-1 me-4">
              <strong>Unidade:</strong> {equino.local}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-white">
        <h5 className="mb-4 text-primary">Procedimentos de Ferrageamento</h5>

        <div className="mb-3">
          <label className="form-label">Procedimento</label>

          <select
            name="procedimento"
            className="form-select"
            value={formData.procedimento}
            onChange={handleChange}
            required
          >
            <option value="">Selecione</option>
            <option value="Ferrar">Ferrar</option>
            <option value="Reprego">Reprego</option>
            <option value="Curativo">Curativo</option>
          </select>
        </div>

        {formData.procedimento === 'Ferrar' && (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label">Qtd. de Ferraduras</label>

                <input
                  type="number"
                  className="form-control"
                  name="ferros"
                  value={formData.ferros}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Tamanho da Ferradura</label>

                <select
                  className="form-select"
                  name="numeroFerro"
                  value={formData.numeroFerro}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>

                  {tamanhosFerradura.map((tamanho) => (
                    <option key={tamanho} value={tamanho}>
                      Nº {tamanho}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Qtd. de Cravos</label>

                <input
                  type="number"
                  className="form-control"
                  name="cravos"
                  value={formData.cravos}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Tipo de Ferradura</label>

                <select
                  className="form-select"
                  name="tipoFerradura"
                  value={formData.tipoFerradura}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>

                  {tiposFerradura.map((tipoItem) => (
                    <option key={tipoItem} value={tipoItem}>
                      {tipoItem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Tipo de Justura</label>

                <select
                  className="form-select"
                  name="tipoJustura"
                  value={formData.tipoJustura}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>

                  {tiposJustura.map((tipoItem) => (
                    <option key={tipoItem} value={tipoItem}>
                      {tipoItem}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Tipo de Cravo</label>

                <select
                  className="form-select"
                  name="tipoCravo"
                  value={formData.tipoCravo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>

                  {tiposCravo.map((tipoItem) => (
                    <option key={tipoItem} value={tipoItem}>
                      {tipoItem}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Tipo de Ferrageamento</label>

                <select
                  className="form-select"
                  name="tipoFerrageamento"
                  value={formData.tipoFerrageamento}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>

                  {tiposFerrageamento.map((tipoItem) => (
                    <option key={tipoItem} value={tipoItem}>
                      {tipoItem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Data do próximo procedimento</label>

                <input
                  type="date"
                  className="form-control"
                  name="dataProximoProcedimento"
                  value={formData.dataProximoProcedimento || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
        )}

        {formData.procedimento === 'Reprego' && (
          <>
            {carregandoUltimoFerrageamento && (
              <div className="alert alert-secondary">
                Buscando último ferrageamento do equino...
              </div>
            )}

            {!carregandoUltimoFerrageamento && ultimoFerrageamento && (
              <div className="alert alert-warning border-start border-4 border-warning">
                <h5 className="text-warning-emphasis mb-3">
                  Último ferrageamento encontrado
                </h5>

                <div className="row">
                  <div className="col-md-3 mb-2">
                    <strong>Data:</strong>{' '}
                    {formatarData(obterDataFerrageamento(ultimoFerrageamento))}
                  </div>

                  <div className="col-md-3 mb-2">
                    <strong>Ferradura:</strong>{' '}
                    {ultimoFerrageamento.tipoFerradura || '—'}
                  </div>

                  <div className="col-md-3 mb-2">
                    <strong>Tamanho:</strong>{' '}
                    {ultimoFerrageamento.numeroFerro
                      ? `Nº ${ultimoFerrageamento.numeroFerro}`
                      : '—'}
                  </div>

                  <div className="col-md-3 mb-2">
                    <strong>Qtd. Ferraduras:</strong>{' '}
                    {ultimoFerrageamento.ferros ?? '—'}
                  </div>

                  <div className="col-md-3 mb-2">
                    <strong>Tipo de Cravo:</strong>{' '}
                    {ultimoFerrageamento.tipoCravo || '—'}
                  </div>

                  <div className="col-md-3 mb-2">
                    <strong>Justura:</strong>{' '}
                    {ultimoFerrageamento.tipoJustura || '—'}
                  </div>

                  <div className="col-md-3 mb-2">
                    <strong>Ferrageamento:</strong>{' '}
                    {ultimoFerrageamento.tipoFerrageamento || '—'}
                  </div>

                  <div className="col-md-3 mb-2">
                    <strong>Cravos:</strong>{' '}
                    {ultimoFerrageamento.cravos ?? '—'}
                  </div>
                </div>

                {ultimoFerrageamento.observacoes && (
                  <div className="mt-2">
                    <strong>Observações:</strong> {ultimoFerrageamento.observacoes}
                  </div>
                )}
              </div>
            )}

            {!carregandoUltimoFerrageamento && !ultimoFerrageamento && (
              <div className="alert alert-danger">
                Nenhum ferrageamento anterior encontrado para este equino. Verifique se o equino já possui um procedimento de Ferrar cadastrado.
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Patas</label>

              <div className="row">
                {patasOptions.map((pata) => (
                  <div className="col-md-3" key={pata}>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="patas"
                        value={pata}
                        checked={formData.patas.includes(pata)}
                        onChange={handleChange}
                        id={pata}
                        required={formData.patas.length === 0}
                      />

                      <label className="form-check-label" htmlFor={pata}>
                        {pata}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Ferro Novo?</label>

                <select
                  className="form-select"
                  name="ferroNovo"
                  value={formData.ferroNovo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Tamanho da Ferradura</label>

                <select
                  className="form-select"
                  name="numeroFerro"
                  value={formData.numeroFerro}
                  onChange={handleChange}
                  required={formData.ferroNovo === 'Sim'}
                  disabled={formData.ferroNovo !== 'Sim'}
                >
                  <option value="">Selecione</option>

                  {tamanhosFerradura.map((tamanho) => (
                    <option key={tamanho} value={tamanho}>
                      Nº {tamanho}
                    </option>
                  ))}
                </select>

                <small className="text-muted">
                  {formData.ferroNovo === 'Sim'
                    ? 'Informe o tamanho da ferradura nova.'
                    : 'Quando não usa ferro novo, o tamanho vem apenas como referência do último ferrageamento.'}
                </small>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Qtd. de Ferraduras Usadas</label>

                <input
                  type="number"
                  className="form-control"
                  value={quantidadeFerradurasReprego}
                  readOnly
                />

                <small className="text-muted">
                  Calculado automaticamente pela quantidade de patas selecionadas quando houver ferro novo.
                </small>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Qtd. de Cravos Usados</label>

                <input
                  type="number"
                  className="form-control"
                  name="cravosUsados"
                  value={formData.cravosUsados}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>
          </>
        )}

        {formData.procedimento === 'Curativo' && (
          <div className="mb-3">
            <label className="form-label">Tipo de Curativo</label>

            <input
              type="text"
              className="form-control"
              name="tipoCurativo"
              value={formData.tipoCurativo}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="observacoes" className="form-label">
            Observações
          </label>

          <textarea
            className="form-control"
            id="observacoes"
            name="observacoes"
            rows="4"
            value={formData.observacoes}
            onChange={handleChange}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>

          <button type="submit" className="btn btn-success">
            {modoEdicao ? 'Editar' : 'Salvar'}
          </button>
        </div>
      </form>

      <ModalGenerico
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        tipo="mensagem"
        tamanho="medio"
        icone={<FaCheckCircle size={48} color="#4caf50" />}
        titulo={modoEdicao ? 'Dados atualizados com sucesso!' : 'Dados salvos com sucesso!'}
        subtitulo={
          modoEdicao
            ? 'O registro foi atualizado corretamente no banco de dados.'
            : 'O registro foi adicionado corretamente ao banco de dados.'
        }
      />
    </div>
  );
};

export default VeterinariaFerrageamentoEquinoForm;
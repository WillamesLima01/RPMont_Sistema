import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import { FaPrint, FaFilter, FaFileAlt, FaSearch, FaUndo } from 'react-icons/fa';
import { imprimirRelatorioMedicamento } from './utils/imprimirRelatorioMedicamento';
import "../../../index.css";
import './Veterinaria.css';

const FILTROS_INICIAIS = {
  medicamentoId: '',
  fabricante: '',
  dataInicial: '',
  dataFinal: '',
  validadeInicial: '',
  validadeFinal: '',
  somenteComEstoque: false,
  somenteVencendo: false,
  diasVencimento: 30
};

const TIPOS_RELATORIO_INICIAIS = {
  estoque: true,
  entradas: false,
  saidas: false
};

const VeterinariaRelatorioMedicamento = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [saidas, setSaidas] = useState([]);

  // Estados dos campos da tela (edição)
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [tiposRelatorio, setTiposRelatorio] = useState(TIPOS_RELATORIO_INICIAIS);

  // Estados realmente aplicados no relatório
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_INICIAIS);
  const [tiposRelatorioAplicados, setTiposRelatorioAplicados] = useState(TIPOS_RELATORIO_INICIAIS);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [buscaRealizada, setBuscaRealizada] = useState(true);

  const estiloBoxTipos = {
    width: '100%',
    padding: '18px',
    borderRadius: '16px',
    background: '#eef4ff',
    border: '1px solid #cdddfc',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)'
  };

  const estiloTituloTipos = {
    fontWeight: 700,
    fontSize: '1.05rem',
    color: '#0d6efd',
    marginBottom: '16px'
  };

  const montarEstiloCardTipo = (ativo) => ({
    width: '100%',
    minHeight: '64px',
    margin: 0,
    padding: '16px 18px',
    borderRadius: '12px',
    border: ativo ? '1px solid #0d6efd' : '1px solid #d8e2f0',
    background: ativo ? '#dbeafe' : '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s ease'
  });

  const estiloCheckboxTipo = {
    margin: 0,
    transform: 'scale(1.15)',
    accentColor: '#0d6efd',
    cursor: 'pointer'
  };

  const montarEstiloTextoTipo = (ativo) => ({
    lineHeight: 1,
    color: ativo ? '#0b4fcf' : '#1f2937'
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro('');

      const [medicamentosResponse, entradasResponse, saidasResponse] = await Promise.all([
        axios.get('/medicamentos'),
        axios.get('/entradasMedicamento'),
        axios.get('/saidasMedicamento')
      ]);

      setMedicamentos(Array.isArray(medicamentosResponse.data) ? medicamentosResponse.data : []);
      setEntradas(Array.isArray(entradasResponse.data) ? entradasResponse.data : []);
      setSaidas(Array.isArray(saidasResponse.data) ? saidasResponse.data : []);
    } catch (error) {
      console.error('Erro ao carregar relatório de medicamentos:', error);
      setErro('Erro ao carregar os dados do relatório.');
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFiltros((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTipoRelatorioChange = (e) => {
    const { name, checked } = e.target;

    setTiposRelatorio((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleBuscarDados = () => {
    setFiltrosAplicados({ ...filtros });
    setTiposRelatorioAplicados({ ...tiposRelatorio });
    setBuscaRealizada(true);
  };

  const limparFiltros = () => {
    setFiltros(FILTROS_INICIAIS);
    setTiposRelatorio(TIPOS_RELATORIO_INICIAIS);

    setFiltrosAplicados(FILTROS_INICIAIS);
    setTiposRelatorioAplicados(TIPOS_RELATORIO_INICIAIS);

    setBuscaRealizada(true);
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

  const hoje = new Date();
  const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  const calcularEstoqueAtual = (medicamentoId) => {
    const totalEntradas = entradas
      .filter((entrada) => String(entrada.medicamentoId) === String(medicamentoId))
      .reduce((acc, item) => acc + Number(item.quantidadeBase || 0), 0);

    const totalSaidas = saidas
      .filter((saida) => String(saida.medicamentoId) === String(medicamentoId))
      .reduce((acc, item) => acc + Number(item.quantidadeBase || 0), 0);

    return totalEntradas - totalSaidas;
  };

  const entradasFiltradas = useMemo(() => {
    return entradas.filter((entrada) => {
      const atendeMedicamento =
        !filtrosAplicados.medicamentoId ||
        String(entrada.medicamentoId) === String(filtrosAplicados.medicamentoId);

      const atendeFabricante =
        !filtrosAplicados.fabricante ||
        normalizar(entrada.fabricante).includes(normalizar(filtrosAplicados.fabricante));

      const atendeDataInicial =
        !filtrosAplicados.dataInicial || entrada.dataEntrada >= filtrosAplicados.dataInicial;

      const atendeDataFinal =
        !filtrosAplicados.dataFinal || entrada.dataEntrada <= filtrosAplicados.dataFinal;

      const atendeValidadeInicial =
        !filtrosAplicados.validadeInicial ||
        (entrada.validade && entrada.validade >= filtrosAplicados.validadeInicial);

      const atendeValidadeFinal =
        !filtrosAplicados.validadeFinal ||
        (entrada.validade && entrada.validade <= filtrosAplicados.validadeFinal);

      return (
        atendeMedicamento &&
        atendeFabricante &&
        atendeDataInicial &&
        atendeDataFinal &&
        atendeValidadeInicial &&
        atendeValidadeFinal
      );
    });
  }, [entradas, filtrosAplicados]);

  const saidasFiltradas = useMemo(() => {
    return saidas.filter((saida) => {
      const atendeMedicamento =
        !filtrosAplicados.medicamentoId ||
        String(saida.medicamentoId) === String(filtrosAplicados.medicamentoId);

      const atendeFabricante =
        !filtrosAplicados.fabricante ||
        normalizar(saida.fabricante).includes(normalizar(filtrosAplicados.fabricante));

      const atendeDataInicial =
        !filtrosAplicados.dataInicial || saida.dataSaida >= filtrosAplicados.dataInicial;

      const atendeDataFinal =
        !filtrosAplicados.dataFinal || saida.dataSaida <= filtrosAplicados.dataFinal;

      return atendeMedicamento && atendeFabricante && atendeDataInicial && atendeDataFinal;
    });
  }, [saidas, filtrosAplicados]);

  const estoqueFiltrado = useMemo(() => {
    return medicamentos.filter((med) => {
      const estoqueAtual = calcularEstoqueAtual(med.id);

      const atendeMedicamento =
        !filtrosAplicados.medicamentoId || String(med.id) === String(filtrosAplicados.medicamentoId);

      const atendeFabricante =
        !filtrosAplicados.fabricante ||
        normalizar(med.fabricante).includes(normalizar(filtrosAplicados.fabricante));

      const atendeSomenteComEstoque =
        !filtrosAplicados.somenteComEstoque || estoqueAtual > 0;

      const entradasDoMedicamento = entradas.filter(
        (entrada) => String(entrada.medicamentoId) === String(med.id)
      );

      const validadeMaisProxima = entradasDoMedicamento
        .filter((e) => e.validade)
        .map((e) => new Date(`${e.validade}T00:00:00`))
        .sort((a, b) => a - b)[0];

      const atendeValidadeInicial =
        !filtrosAplicados.validadeInicial ||
        (validadeMaisProxima &&
          validadeMaisProxima >= new Date(`${filtrosAplicados.validadeInicial}T00:00:00`));

      const atendeValidadeFinal =
        !filtrosAplicados.validadeFinal ||
        (validadeMaisProxima &&
          validadeMaisProxima <= new Date(`${filtrosAplicados.validadeFinal}T00:00:00`));

      let atendeSomenteVencendo = true;
      if (filtrosAplicados.somenteVencendo) {
        if (!validadeMaisProxima) {
          atendeSomenteVencendo = false;
        } else {
          const limite = new Date(hojeSemHora);
          limite.setDate(limite.getDate() + Number(filtrosAplicados.diasVencimento || 30));
          atendeSomenteVencendo = validadeMaisProxima <= limite;
        }
      }

      return (
        atendeMedicamento &&
        atendeFabricante &&
        atendeSomenteComEstoque &&
        atendeValidadeInicial &&
        atendeValidadeFinal &&
        atendeSomenteVencendo
      );
    });
  }, [medicamentos, entradas, filtrosAplicados]);

  const resumo = useMemo(() => {
    const totalMedicamentos = medicamentos.length;

    const totalEstoque = estoqueFiltrado.reduce((acc, med) => {
      return acc + Math.max(0, calcularEstoqueAtual(med.id));
    }, 0);

    const totalEntradas = entradasFiltradas.reduce((acc, item) => {
      return acc + Number(item.quantidadeBase || 0);
    }, 0);

    const totalSaidas = saidasFiltradas.reduce((acc, item) => {
      return acc + Number(item.quantidadeBase || 0);
    }, 0);

    return {
      totalMedicamentos,
      totalEstoque,
      totalEntradas,
      totalSaidas
    };
  }, [medicamentos, estoqueFiltrado, entradasFiltradas, saidasFiltradas]);

  const nomeMedicamentoPorId = (id) => {
    const med = medicamentos.find((m) => String(m.id) === String(id));
    return med?.nome || '-';
  };

  const handleImprimir = () => {
    imprimirRelatorioMedicamento({
      tiposRelatorio: tiposRelatorioAplicados,
      estoqueFiltrado,
      entradasFiltradas,
      saidasFiltradas,
      entradas,
      resumo,
      calcularEstoqueAtual,
      formatarData,
      nomeMedicamentoPorId
    });
  };

  const renderTabelaEstoque = () => (
    <div className="card shadow-sm border-0 rounded-4 mt-4">
      <div className="card-body p-0">
        <div className="card-header bg-white border-0 pt-4 px-4">
          <h5 className="mb-0">Relatório de Estoque Atual</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Medicamento</th>
                <th>Fabricante</th>
                <th>Categoria</th>
                <th>Forma</th>
                <th>Unidade Base</th>
                <th>Qtde Estoque</th>
                <th>Validade Mais Próxima</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {estoqueFiltrado.length > 0 ? (
                estoqueFiltrado.map((med) => {
                  const entradasDoMedicamento = entradas.filter(
                    (entrada) => String(entrada.medicamentoId) === String(med.id)
                  );

                  const validadeMaisProxima = entradasDoMedicamento
                    .filter((e) => e.validade)
                    .map((e) => new Date(`${e.validade}T00:00:00`))
                    .sort((a, b) => a - b)[0];

                  const estoqueAtual = calcularEstoqueAtual(med.id);

                  return (
                    <tr key={med.id}>
                      <td className="ps-3">
                        <div className="fw-semibold">{med.nome || '-'}</div>
                        <small className="text-muted">{med.nomeComercial || '-'}</small>
                      </td>
                      <td>{med.fabricante || '-'}</td>
                      <td>{med.categoria || '-'}</td>
                      <td>{med.forma || '-'}</td>
                      <td>{med.unidadeBase || '-'}</td>
                      <td>
                        <span className="fw-semibold">
                          {estoqueAtual} {med.unidadeBase || ''}
                        </span>
                      </td>
                      <td>
                        {validadeMaisProxima
                          ? validadeMaisProxima.toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td>
                        <span className={`badge ${med.ativo ? 'bg-success' : 'bg-secondary'}`}>
                          {med.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabelaEntradas = () => (
    <div className="card shadow-sm border-0 rounded-4 mt-4">
      <div className="card-body p-0">
        <div className="card-header bg-white border-0 pt-4 px-4">
          <h5 className="mb-0">Relatório de Entradas</h5>
        </div>
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
              </tr>
            </thead>
            <tbody>
              {entradasFiltradas.length > 0 ? (
                entradasFiltradas.map((entrada) => (
                  <tr key={entrada.id}>
                    <td className="ps-3">
                      {entrada.medicamentoNome || nomeMedicamentoPorId(entrada.medicamentoId)}
                    </td>
                    <td>{entrada.fabricante || '-'}</td>
                    <td>{entrada.lote || '-'}</td>
                    <td>{formatarData(entrada.validade)}</td>
                    <td>{entrada.quantidadeInformada || '-'} {entrada.unidadeInformada || ''}</td>
                    <td>{entrada.quantidadeBase || '-'} {entrada.unidadeBase || ''}</td>
                    <td>{formatarData(entrada.dataEntrada)}</td>
                    <td>{entrada.fornecedor || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabelaSaidas = () => (
    <div className="card shadow-sm border-0 rounded-4 mt-4">
      <div className="card-body p-0">
        <div className="card-header bg-white border-0 pt-4 px-4">
          <h5 className="mb-0">Relatório de Saídas</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Medicamento</th>
                <th>Fabricante</th>
                <th>Tipo Saída</th>
                <th>Quantidade</th>
                <th>Qtde Base</th>
                <th>Data Saída</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {saidasFiltradas.length > 0 ? (
                saidasFiltradas.map((saida) => (
                  <tr key={saida.id}>
                    <td className="ps-3">
                      {saida.medicamentoNome || nomeMedicamentoPorId(saida.medicamentoId)}
                    </td>
                    <td>{saida.fabricante || '-'}</td>
                    <td>{saida.tipoSaida || '-'}</td>
                    <td>{saida.quantidadeInformada || '-'} {saida.unidadeInformada || ''}</td>
                    <td>{saida.quantidadeBase || '-'} {saida.unidadeBase || ''}</td>
                    <td>{formatarData(saida.dataSaida)}</td>
                    <td>{saida.observacao || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const nenhumTipoSelecionado =
    !tiposRelatorioAplicados.estoque &&
    !tiposRelatorioAplicados.entradas &&
    !tiposRelatorioAplicados.saidas;

  return (
    <>
      <Navbar />

      <div className="container mt-5 relatorio-medicamento-page">
        <div className="row justify-content-center">
          <div className="col-lg-12 mt-5">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-5 mb-4">
              <div>
                <h2 className="titulo-principal mb-1 d-flex align-items-center gap-2">
                  <FaFileAlt />
                  Relatório de Medicamentos
                </h2>
                <p className="text-muted mb-0">
                  Gere relatórios completos de estoque, entradas e saídas de medicamentos.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleImprimir}
              >
                <FaPrint className="me-2" />
                Imprimir
              </button>
            </div>

            {erro && <div className="alert alert-danger">{erro}</div>}

            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FaFilter />
                  <h5 className="mb-0">Filtros do Relatório</h5>
                </div>

                <div className="row g-3">
                  <div className="col-md-12">
                    <div style={estiloBoxTipos}>
                      <div style={estiloTituloTipos}>
                        Tipos de Relatório
                      </div>

                      <div className="row g-3">
                        <div className="col-md-4">
                          <label
                            htmlFor="tipoEstoque"
                            style={montarEstiloCardTipo(tiposRelatorio.estoque)}
                          >
                            <input
                              type="checkbox"
                              id="tipoEstoque"
                              name="estoque"
                              checked={tiposRelatorio.estoque}
                              onChange={handleTipoRelatorioChange}
                              style={estiloCheckboxTipo}
                            />
                            <span style={montarEstiloTextoTipo(tiposRelatorio.estoque)}>
                              Estoque Atual
                            </span>
                          </label>
                        </div>

                        <div className="col-md-4">
                          <label
                            htmlFor="tipoEntradas"
                            style={montarEstiloCardTipo(tiposRelatorio.entradas)}
                          >
                            <input
                              type="checkbox"
                              id="tipoEntradas"
                              name="entradas"
                              checked={tiposRelatorio.entradas}
                              onChange={handleTipoRelatorioChange}
                              style={estiloCheckboxTipo}
                            />
                            <span style={montarEstiloTextoTipo(tiposRelatorio.entradas)}>
                              Entradas
                            </span>
                          </label>
                        </div>

                        <div className="col-md-4">
                          <label
                            htmlFor="tipoSaidas"
                            style={montarEstiloCardTipo(tiposRelatorio.saidas)}
                          >
                            <input
                              type="checkbox"
                              id="tipoSaidas"
                              name="saidas"
                              checked={tiposRelatorio.saidas}
                              onChange={handleTipoRelatorioChange}
                              style={estiloCheckboxTipo}
                            />
                            <span style={montarEstiloTextoTipo(tiposRelatorio.saidas)}>
                              Saídas
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Medicamento</label>
                    <select
                      className="form-select"
                      name="medicamentoId"
                      value={filtros.medicamentoId}
                      onChange={handleChange}
                    >
                      <option value="">Todos</option>
                      {medicamentos.map((med) => (
                        <option key={med.id} value={med.id}>
                          {med.nome} - {med.fabricante}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Fabricante</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        name="fabricante"
                        value={filtros.fabricante}
                        onChange={handleChange}
                        placeholder="Digite o fabricante"
                      />
                    </div>
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Dias p/ vencer</label>
                    <input
                      type="number"
                      className="form-control"
                      name="diasVencimento"
                      value={filtros.diasVencimento}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Data Inicial</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dataInicial"
                      value={filtros.dataInicial}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Data Final</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dataFinal"
                      value={filtros.dataFinal}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Validade Inicial</label>
                    <input
                      type="date"
                      className="form-control"
                      name="validadeInicial"
                      value={filtros.validadeInicial}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Validade Final</label>
                    <input
                      type="date"
                      className="form-control"
                      name="validadeFinal"
                      value={filtros.validadeFinal}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="somenteComEstoque"
                        name="somenteComEstoque"
                        checked={filtros.somenteComEstoque}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="somenteComEstoque">
                        Somente com estoque
                      </label>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="somenteVencendo"
                        name="somenteVencendo"
                        checked={filtros.somenteVencendo}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="somenteVencendo">
                        Somente vencendo
                      </label>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <button
                      type="button"
                      className="btn btn-primary w-100 mt-md-4"
                      onClick={handleBuscarDados}
                    >
                      <FaSearch className="me-2" />
                      Buscar Dados
                    </button>
                  </div>

                  <div className="col-md-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 mt-md-4"
                      onClick={limparFiltros}
                    >
                      <FaUndo className="me-2" />
                      Limpar Filtros
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3 mt-2">
              <div className="col-md-3">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body">
                    <small className="text-muted">Medicamentos cadastrados</small>
                    <h4 className="mb-0">{resumo.totalMedicamentos}</h4>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body">
                    <small className="text-muted">Total em estoque</small>
                    <h4 className="mb-0">{resumo.totalEstoque}</h4>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body">
                    <small className="text-muted">Total de entradas</small>
                    <h4 className="mb-0">{resumo.totalEntradas}</h4>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body">
                    <small className="text-muted">Total de saídas</small>
                    <h4 className="mb-0">{resumo.totalSaidas}</h4>
                  </div>
                </div>
              </div>
            </div>

            {carregando ? (
              <div className="alert alert-info mt-4">Carregando relatório...</div>
            ) : !buscaRealizada ? (
              <div className="alert alert-secondary mt-4">
                Preencha os filtros desejados e clique em <strong>Buscar Dados</strong>.
              </div>
            ) : nenhumTipoSelecionado ? (
              <div className="alert alert-warning mt-4">
                Selecione pelo menos um tipo de relatório para visualizar os dados.
              </div>
            ) : (
              <>
                {tiposRelatorioAplicados.estoque && renderTabelaEstoque()}
                {tiposRelatorioAplicados.entradas && renderTabelaEntradas()}
                {tiposRelatorioAplicados.saidas && renderTabelaSaidas()}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VeterinariaRelatorioMedicamento;
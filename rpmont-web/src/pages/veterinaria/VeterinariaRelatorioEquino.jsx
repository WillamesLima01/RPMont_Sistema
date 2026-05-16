import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import html2pdf from 'html2pdf.js';
import './Veterinaria.css';
import { useNavigate } from 'react-router-dom';

const VeterinariaRelatorioEquino = () => {
  const [equinos, setEquinos] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [medicacoesAtendimento, setMedicacoesAtendimento] = useState([]);
  const [vermifugacoes, setVermifugacoes] = useState([]);
  const [vacinacoes, setVacinacoes] = useState([]);
  const [escalas, setEscalas] = useState([]);
  const [baixas, setBaixas] = useState([]);

  const [enfermidades, setEnfermidades] = useState([]);
  const [enfTexto, setEnfTexto] = useState('');
  const [abrirSugestoes, setAbrirSugestoes] = useState(false);
  const [carregandoEnf, setCarregandoEnf] = useState(false);

  const caixaEnfRef = useRef(null);
  const blurTimer = useRef(null);

  const [filtroEquino, setFiltroEquino] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');

  const [tiposSelecionados, setTiposSelecionados] = useState({
    atendimentos: true,
    medicacoes: true,
    vermifugacoes: true,
    vacinacoes: true,
    escalas: true,
    baixas: true,
  });

  const [resultado, setResultado] = useState(null);
  const [totalOcorrenciasEnf, setTotalOcorrenciasEnf] = useState(null);

  const divRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregandoEnf(true);

        const [
          equinoResponse,
          atendimentoResponse,
          medicacoesResponse,
          vermifugacaoResponse,
          vacinacaoResponse,
          escalaResponse,
          baixasResponse
        ] = await Promise.all([
          axios.get('/equino'),
          axios.get('/atendimentos'),
          axios.get('/medicacoes_atendimento'),
          axios.get('/vermifugacao'),
          axios.get('/vacinacao'),
          axios.get('/escala'),
          axios.get('/equino/historico'),
        ]);

        const equinosData = equinoResponse.data || [];
        const atendimentosData = atendimentoResponse.data || [];
        const medicacoesData = medicacoesResponse.data || [];
        const vermifugacoesData = vermifugacaoResponse.data || [];
        const vacinacoesData = vacinacaoResponse.data || [];
        const escalasData = escalaResponse.data || [];
        const baixasData = baixasResponse.data || [];

        setEquinos(equinosData);
        setAtendimentos(atendimentosData);
        setMedicacoesAtendimento(medicacoesData);
        setVermifugacoes(vermifugacoesData);
        setVacinacoes(vacinacoesData);
        setEscalas(escalasData);
        setBaixas(baixasData);

        const nomesUnicos = Array.from(
          new Set(
            atendimentosData
              .map((a) => (a?.enfermidade ? String(a.enfermidade).trim() : ''))
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

        setEnfermidades(
          nomesUnicos.map((nome, i) => ({
            id: i + 1,
            nome,
          }))
        );
      } catch (error) {
        console.error('Erro ao carregar dados do relatório:', error);
        setEquinos([]);
        setAtendimentos([]);
        setMedicacoesAtendimento([]);
        setVermifugacoes([]);
        setVacinacoes([]);
        setEscalas([]);
        setBaixas([]);
        setEnfermidades([]);
      } finally {
        setCarregandoEnf(false);
      }
    };

    carregarDados();
  }, []);

  useEffect(() => {
    const handleClickFora = (event) => {
      if (caixaEnfRef.current && !caixaEnfRef.current.contains(event.target)) {
        setAbrirSugestoes(false);
      }
    };

    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const obterEquinoId = (item) =>
    item?.equinoId ?? item?.equino?.id ?? item?.equino_id ?? item?.idEquino ?? null;

  const obterDataAtendimento = (item) =>
    item?.dataAtendimento ?? item?.data ?? item?.dataCadastro ?? null;

  const obterDataProcedimento = (item) =>
    item?.dataCadastro ?? item?.data ?? null;

  const obterDataEscala = (item) =>
    item?.dataCadastro ?? item?.data ?? null;

  const obterDataBaixa = (item) =>
    item?.dataBaixa ?? item?.data_baixa ?? null;

  const obterDataRetorno = (item) =>
    item?.dataRetorno ?? item?.data_retorno ?? null;

  const converterParaData = (data, horario = '12:00:00') => {
    if (!data) return null;
    const apenasData = String(data).slice(0, 10);
    const dataConvertida = new Date(`${apenasData}T${horario}`);
    if (Number.isNaN(dataConvertida.getTime())) return null;
    return dataConvertida;
  };

  const estaNoPeriodo = (data, inicioDate, fimDate) => {
    const dataConvertida = converterParaData(data);
    if (!dataConvertida) return false;
    return dataConvertida >= inicioDate && dataConvertida <= fimDate;
  };

  const formatarData = (data) => {
    if (!data) return '—';
    const dataConvertida = converterParaData(data, '00:00:00');
    if (!dataConvertida) return '—';
    return dataConvertida.toLocaleDateString('pt-BR');
  };

  const sugestoesEnf = enfTexto.trim()
    ? enfermidades.filter((e) =>
        (e.nome || '').toLowerCase().includes(enfTexto.trim().toLowerCase())
      )
    : enfermidades;

  const selecionarEnf = (item) => {
    setEnfTexto(item.nome);
    setAbrirSugestoes(false);
  };

  const limparEnf = () => {
    setEnfTexto('');
    setAbrirSugestoes(false);
  };

  const handleTipoChange = (tipo) => {
    setTiposSelecionados((prev) => ({
      ...prev,
      [tipo]: !prev[tipo],
    }));
  };

  const algumTipoSelecionado = Object.values(tiposSelecionados).some(Boolean);

  const tiposAtivos = algumTipoSelecionado
    ? tiposSelecionados
    : {
        atendimentos: true,
        medicacoes: true,
        vermifugacoes: true,
        vacinacoes: true,
        escalas: true,
        baixas: true,
      };

  const gerarRelatorio = () => {
    const inicioDate = filtroInicio
      ? new Date(`${filtroInicio}T00:00:00`)
      : new Date('1970-01-01T00:00:00');

    const fimDate = filtroFim
      ? new Date(`${filtroFim}T23:59:59`)
      : new Date('9999-12-31T23:59:59');

    const equinosSelecionados = filtroEquino
      ? equinos.filter((e) => String(e.id) === String(filtroEquino))
      : equinos;

    const enfermidadeFiltro = enfTexto.trim().toLowerCase();

    const dados = equinosSelecionados.map((equinoAtual) => {
      const atendimentosDoEquino = atendimentos
        .filter((atendimento) => {
          const pertenceAoEquino =
            String(obterEquinoId(atendimento)) === String(equinoAtual.id);

          const dentroDoPeriodo = estaNoPeriodo(
            obterDataAtendimento(atendimento),
            inicioDate,
            fimDate
          );

          const atendeFiltroEnfermidade = enfermidadeFiltro
            ? String(atendimento.enfermidade || '')
                .toLowerCase()
                .includes(enfermidadeFiltro)
            : true;

          return pertenceAoEquino && dentroDoPeriodo && atendeFiltroEnfermidade;
        })
        .map((atendimento) => {
          const medicacoesDoAtendimento = medicacoesAtendimento.filter((medicacao) => {
            const pertenceAoAtendimento =
              String(medicacao.atendimentoId) === String(atendimento.id);

            const pertenceAoEquino =
              String(obterEquinoId(medicacao)) === String(equinoAtual.id);

            return pertenceAoAtendimento && pertenceAoEquino;
          });

          return {
            ...atendimento,
            medicacoes: medicacoesDoAtendimento,
          };
        });

      const vermifugacoesDoEquino = vermifugacoes.filter((v) => {
        return (
          String(obterEquinoId(v)) === String(equinoAtual.id) &&
          estaNoPeriodo(obterDataProcedimento(v), inicioDate, fimDate)
        );
      });

      const vacinacoesDoEquino = vacinacoes.filter((v) => {
        return (
          String(obterEquinoId(v)) === String(equinoAtual.id) &&
          estaNoPeriodo(obterDataProcedimento(v), inicioDate, fimDate)
        );
      });

      const escalasDoEquino = escalas.filter((s) => {
        return (
          String(obterEquinoId(s)) === String(equinoAtual.id) &&
          estaNoPeriodo(obterDataEscala(s), inicioDate, fimDate)
        );
      });

      const baixasDoEquino = baixas.filter((b) => {
        return String(obterEquinoId(b)) === String(equinoAtual.id);
      });

      const baixasFiltradas = [];
      let totalDiasBaixado = 0;

      baixasDoEquino.forEach((baixa) => {
        const dataBaixa = converterParaData(obterDataBaixa(baixa));
        const dataRetorno = converterParaData(obterDataRetorno(baixa));

        if (!dataBaixa) return;

        const hoje = new Date();
        hoje.setHours(23, 59, 59, 999);

        const limiteFinalSemRetorno = fimDate < hoje ? fimDate : hoje;

        const sobrepoePeriodo =
          dataBaixa <= fimDate &&
          (dataRetorno ? dataRetorno >= inicioDate : limiteFinalSemRetorno >= inicioDate);

        if (!sobrepoePeriodo) return;

        const inicioPeriodo = dataBaixa < inicioDate ? inicioDate : dataBaixa;

        const fimPeriodo = dataRetorno
          ? dataRetorno < fimDate
            ? dataRetorno
            : fimDate
          : limiteFinalSemRetorno;

        const dias = Math.max(
          1,
          Math.ceil((fimPeriodo - inicioPeriodo) / (1000 * 60 * 60 * 24))
        );

        totalDiasBaixado += dias;

        baixasFiltradas.push({
          dataBaixa: formatarData(obterDataBaixa(baixa)),
          dataRetorno: obterDataRetorno(baixa)
            ? formatarData(obterDataRetorno(baixa))
            : '—',
          dias,
        });
      });

      const cargaTotal = escalasDoEquino.reduce(
        (acc, item) => acc + (Number(item.cargaHoraria) || 0),
        0
      );

      const totalMedicacoes = atendimentosDoEquino.reduce(
        (acc, a) => acc + (a.medicacoes?.length || 0),
        0
      );

      return {
        equino: equinoAtual.nome,
        atendimentos:
          tiposAtivos.atendimentos || tiposAtivos.medicacoes
            ? atendimentosDoEquino
            : [],
        vermifugacoes: tiposAtivos.vermifugacoes ? vermifugacoesDoEquino : [],
        vacinacoes: tiposAtivos.vacinacoes ? vacinacoesDoEquino : [],
        escalas: tiposAtivos.escalas ? escalasDoEquino : [],
        baixas: tiposAtivos.baixas ? baixasFiltradas : [],
        cargaTotal,
        totalAtendimentos: atendimentosDoEquino.length,
        totalMedicacoes,
        totalVermifugacoes: vermifugacoesDoEquino.length,
        totalVacinacoes: vacinacoesDoEquino.length,
        totalBaixas: baixasFiltradas.length,
        totalDiasBaixado,
        totalEscalas: escalasDoEquino.length,
      };
    });

    const dadosFiltrados = dados.filter((d) => {
      const temAtend = tiposAtivos.atendimentos && d.totalAtendimentos > 0;
      const temMed = tiposAtivos.medicacoes && d.totalMedicacoes > 0;
      const temVerm = tiposAtivos.vermifugacoes && d.totalVermifugacoes > 0;
      const temVac = tiposAtivos.vacinacoes && d.totalVacinacoes > 0;
      const temEsc = tiposAtivos.escalas && d.totalEscalas > 0;
      const temBaixa = tiposAtivos.baixas && d.totalBaixas > 0;

      return temAtend || temMed || temVerm || temVac || temEsc || temBaixa;
    });

    const totalOcorr = enfermidadeFiltro
      ? dadosFiltrados.reduce((acc, d) => acc + d.totalAtendimentos, 0)
      : null;

    setResultado(dadosFiltrados);
    setTotalOcorrenciasEnf(totalOcorr);
  };

  const imprimir = () => window.print();

  const gerarPDF = () => {
    if (!divRef.current) return;
  
    const elementoOriginal = divRef.current;
  
    // Clona o relatório para aplicar ajustes exclusivos do PDF
    const clone = elementoOriginal.cloneNode(true);
    clone.classList.add('pdf-export');
  
    const containerTemporario = document.createElement('div');
    containerTemporario.className = 'pdf-export-wrapper';
    containerTemporario.appendChild(clone);
  
    document.body.appendChild(containerTemporario);
  
    const opcoes = {
      margin: [0.35, 0.35, 0.60, 0.35],
      filename: 'relatorio_equinos.pdf',
      image: {
        type: 'jpeg',
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: clone.scrollWidth,
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: [
          '.print-item',
          '.summary-box',
          '.print-meta-item',
          '.nested-item',
          '.pdf-avoid-break',
        ],
      },
    };
  
    const worker = html2pdf()
      .set(opcoes)
      .from(clone)
      .toPdf();
  
    worker
      .get('pdf')
      .then((pdf) => {
        const totalPaginas = pdf.internal.getNumberOfPages();
        const larguraPagina = pdf.internal.pageSize.getWidth();
        const alturaPagina = pdf.internal.pageSize.getHeight();
  
        for (let pagina = 1; pagina <= totalPaginas; pagina++) {
          pdf.setPage(pagina);
  
          pdf.setFontSize(8);
          pdf.setTextColor(90);
  
          pdf.text(
            `${pagina}/${totalPaginas}`,
            larguraPagina - 0.35,
            alturaPagina - 0.22,
            { align: 'right' }
          );
        }
      })
      .then(() => worker.save())
      .then(() => {
        document.body.removeChild(containerTemporario);
      })
      .catch((error) => {
        console.error('Erro ao gerar PDF:', error);
  
        if (document.body.contains(containerTemporario)) {
          document.body.removeChild(containerTemporario);
        }
      });
  };

  const dataAtualImpressao = new Date().toLocaleString('pt-BR');

  const nomeEquinoSelecionado = filtroEquino
    ? equinos.find((eq) => String(eq.id) === String(filtroEquino))?.nome || 'Desconhecido'
    : 'Todos os equinos';

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <div className="relatorio-page">
        {/* PAINEL DE FILTROS - NÃO IMPRIME */}
        <div className="relatorio-card shadow-sm rounded-4 bg-white p-4 no-print">
          <h2 className="mb-4 text-primary">Relatório de Equinos</h2>

          <div className="row g-3 align-items-end mb-3">
            <div className="col-6 col-md-2">
              <label className="form-label fw-bold">Período Inicial</label>
              <input
                type="date"
                className="form-control"
                value={filtroInicio}
                onChange={(e) => setFiltroInicio(e.target.value)}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label fw-bold">Período Final</label>
              <input
                type="date"
                className="form-control"
                value={filtroFim}
                onChange={(e) => setFiltroFim(e.target.value)}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label fw-bold">Equino</label>
              <select
                className="form-select"
                value={filtroEquino}
                onChange={(e) => setFiltroEquino(e.target.value)}
              >
                <option value="">Todos</option>
                {equinos.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6" ref={caixaEnfRef}>
              <label className="form-label fw-bold">Enfermidade</label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder={carregandoEnf ? 'Carregando...' : 'Clique ou digite para filtrar'}
                  value={enfTexto}
                  onChange={(e) => {
                    setEnfTexto(e.target.value);
                    setAbrirSugestoes(true);
                  }}
                  onFocus={() => setAbrirSugestoes(true)}
                  onBlur={() => {
                    blurTimer.current = setTimeout(() => setAbrirSugestoes(false), 150);
                  }}
                />

                {enfTexto && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary position-absolute top-50 translate-middle-y"
                    style={{ right: 6 }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={limparEnf}
                  >
                    Limpar
                  </button>
                )}

                {abrirSugestoes && sugestoesEnf.length > 0 && (
                  <ul
                    className="list-group shadow-sm"
                    style={{
                      position: 'absolute',
                      zIndex: 20,
                      width: '100%',
                      maxHeight: 220,
                      overflowY: 'auto',
                      marginTop: 4,
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {sugestoesEnf.map((s) => (
                      <li
                        key={s.id}
                        className="list-group-item list-group-item-action"
                        role="button"
                        onClick={() => selecionarEnf(s)}
                        title={s.nome}
                      >
                        {s.nome}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold d-block">Tipos de relatório</label>

            <div className="d-flex flex-wrap gap-4">
              {Object.keys(tiposSelecionados).map((tipo) => (
                <div className="form-check" key={tipo}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`tipo-${tipo}`}
                    checked={tiposSelecionados[tipo]}
                    onChange={() => handleTipoChange(tipo)}
                  />
                  <label className="form-check-label" htmlFor={`tipo-${tipo}`}>
                    {tipo === 'atendimentos' && 'Atendimentos'}
                    {tipo === 'medicacoes' && 'Medicações'}
                    {tipo === 'vermifugacoes' && 'Vermifugações'}
                    {tipo === 'vacinacoes' && 'Vacinações'}
                    {tipo === 'escalas' && 'Escalas'}
                    {tipo === 'baixas' && 'Baixas'}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex justify-content-end gap-3">
            <button className="btn btn-outline-danger" onClick={() => navigate(-1)}>
              Voltar
            </button>
            <button className="btn btn-success" onClick={gerarRelatorio}>
              Gerar Relatório
            </button>
            <button className="btn btn-outline-primary" onClick={imprimir}>
              Imprimir
            </button>
            <button className="btn btn-outline-secondary" onClick={gerarPDF}>
              Gerar PDF
            </button>
          </div>
        </div>

        {/* ÁREA PROFISSIONAL DE IMPRESSÃO */}
        {resultado && (
          <div ref={divRef} className="relatorio-print-area bg-white rounded-4 shadow-sm p-4 mt-4">
            <div className="print-header">
              <div className="print-header-top">
                <div>
                  <div className="print-org">Regimento Coronel Calixto</div>
                  <h1 className="print-title">Relatório de Equinos</h1>
                </div>
                <div className="print-date">Emitido em: {dataAtualImpressao}</div>
              </div>

              <div className="print-meta-grid">
                <div className="print-meta-item">
                  <span className="meta-label">Equino</span>
                  <span className="meta-value">{nomeEquinoSelecionado}</span>
                </div>

                <div className="print-meta-item">
                  <span className="meta-label">Período Inicial</span>
                  <span className="meta-value">{filtroInicio ? formatarData(filtroInicio) : 'Não informado'}</span>
                </div>

                <div className="print-meta-item">
                  <span className="meta-label">Período Final</span>
                  <span className="meta-value">{filtroFim ? formatarData(filtroFim) : 'Não informado'}</span>
                </div>

                <div className="print-meta-item">
                  <span className="meta-label">Enfermidade</span>
                  <span className="meta-value">{enfTexto || 'Não informada'}</span>
                </div>
              </div>
            </div>

            {totalOcorrenciasEnf != null && (
              <div className="alert alert-info mt-3 no-break">
                Ocorrências de <strong>"{enfTexto}"</strong>: <strong>{totalOcorrenciasEnf}</strong>
              </div>
            )}

            {resultado.length > 0 ? (
              <div className="relatorio-result mt-4">
                {resultado.map((r, index) => (
                  <div key={index} className="print-card">
                    <div className="print-card-header">
                      <h3>{r.equino}</h3>
                    </div>

                    <div className="print-summary-grid">
                      <div className="summary-box">
                        <span className="summary-label">Atendimentos</span>
                        <span className="summary-value">{r.totalAtendimentos}</span>
                      </div>
                      <div className="summary-box">
                        <span className="summary-label">Medicações</span>
                        <span className="summary-value">{r.totalMedicacoes}</span>
                      </div>
                      <div className="summary-box">
                        <span className="summary-label">Vermifugações</span>
                        <span className="summary-value">{r.totalVermifugacoes}</span>
                      </div>
                      <div className="summary-box">
                        <span className="summary-label">Vacinações</span>
                        <span className="summary-value">{r.totalVacinacoes}</span>
                      </div>
                      <div className="summary-box">
                        <span className="summary-label">Baixas</span>
                        <span className="summary-value">{r.totalBaixas}</span>
                      </div>
                      <div className="summary-box">
                        <span className="summary-label">Dias Baixado</span>
                        <span className="summary-value">{r.totalDiasBaixado}</span>
                      </div>
                      <div className="summary-box">
                        <span className="summary-label">Escalas</span>
                        <span className="summary-value">{r.totalEscalas}</span>
                      </div>
                      <div className="summary-box">
                        <span className="summary-label">Carga Horária</span>
                        <span className="summary-value">{r.cargaTotal}h</span>
                      </div>
                    </div>

                    {r.atendimentos.length > 0 && (
                      <section className="print-section">
                        <h4>Atendimentos</h4>
                        {r.atendimentos.map((a, i) => (
                          <div key={i} className="print-item">
                            <div className="item-title">
                              <strong>{formatarData(obterDataAtendimento(a))}</strong> — {a.textoConsulta || '—'}
                            </div>
                            {a.enfermidade && (
                              <div className="item-subline">
                                <strong>Enfermidade:</strong> {a.enfermidade}
                              </div>
                            )}

                            {tiposAtivos.medicacoes && a.medicacoes?.length > 0 && (
                              <div className="nested-block">
                                {a.medicacoes.map((m, j) => (
                                  <div key={j} className="nested-item">
                                    <strong>Medicação:</strong> {m.nomeMedicamento || '—'} |{' '}
                                    <strong>Dose:</strong> {m.doseAplicada ?? '—'} {m.unidade || ''} |{' '}
                                    <strong>Origem:</strong> {m.origem || '—'}
                                    {m.observacao ? ` | Obs.: ${m.observacao}` : ''}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </section>
                    )}

                    {r.vermifugacoes.length > 0 && (
                      <section className="print-section">
                        <h4>Vermifugações</h4>
                        {r.vermifugacoes.map((v, i) => (
                          <div key={i} className="print-item">
                            <strong>{formatarData(obterDataProcedimento(v))}</strong> — {v.vermifugo || '—'}
                            {v.dataProximoProcedimento
                              ? ` | Próximo procedimento: ${formatarData(v.dataProximoProcedimento)}`
                              : ''}
                            {v.observacao ? ` | Obs.: ${v.observacao}` : ''}
                          </div>
                        ))}
                      </section>
                    )}

                    {r.vacinacoes.length > 0 && (
                      <section className="print-section">
                        <h4>Vacinações</h4>
                        {r.vacinacoes.map((v, i) => (
                          <div key={i} className="print-item">
                            <strong>{formatarData(obterDataProcedimento(v))}</strong> — {v.nomeVacina || '—'}
                            {v.dataProximoProcedimento
                              ? ` | Próxima dose: ${formatarData(v.dataProximoProcedimento)}`
                              : ''}
                            {v.observacao ? ` | Obs.: ${v.observacao}` : ''}
                          </div>
                        ))}
                      </section>
                    )}

                    {r.baixas.length > 0 && (
                      <section className="print-section">
                        <h4>Baixas</h4>
                        {r.baixas.map((b, i) => (
                          <div key={i} className="print-item">
                            {b.dataRetorno === '—' ? (
                              <>
                                Baixado em <strong>{b.dataBaixa}</strong>, ainda não retornou ({b.dias} dia(s) baixado)
                              </>
                            ) : (
                              <>
                                Baixado em <strong>{b.dataBaixa}</strong>, retornou em <strong>{b.dataRetorno}</strong> ({b.dias} dia(s) baixado)
                              </>
                            )}
                          </div>
                        ))}
                      </section>
                    )}

                    {r.escalas.length > 0 && (
                      <section className="print-section">
                        <h4>Escalas</h4>
                        {r.escalas.map((s, i) => (
                          <div key={i} className="print-item">
                            <strong>{formatarData(obterDataEscala(s))}</strong> — {s.localTrabalho || '—'}, {s.jornadaTrabalho || '—'}, Cavaleiro: {s.cavaleiro || '—'}
                          </div>
                        ))}
                      </section>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-warning mt-3">
                Nenhum resultado encontrado com os filtros informados.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VeterinariaRelatorioEquino;
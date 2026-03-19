import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import 'jspdf-autotable';
import html2pdf from 'html2pdf.js';

import './Veterinaria.css';
import { useNavigate } from 'react-router-dom';

const VeterinariaRelatorioEquino = () => {
  const [equino, setEquino] = useState([]);
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
    const carregar = async () => {
      try {
        setCarregandoEnf(true);

        const [eq, at, med, ver, vac, es, bx] = await Promise.all([
          axios.get('/equino'),
          axios.get('/atendimentos'),
          axios.get('/medicacoesAtendimento'),
          axios.get('/vermifugacoes'),
          axios.get('/vacinacoes'),
          axios.get('/escala'),
          axios.get('/equinosBaixados'),
        ]);

        const equinoData = eq.data || [];
        const atendData = at.data || [];
        const medicData = med.data || [];
        const vermifData = ver.data || [];
        const vacinData = vac.data || [];
        const escalasData = es.data || [];
        const baixasData = bx.data || [];

        setEquino(equinoData);
        setAtendimentos(atendData);
        setMedicacoesAtendimento(medicData);
        setVermifugacoes(vermifData);
        setVacinacoes(vacinData);
        setEscalas(escalasData);
        setBaixas(baixasData);

        const nomesUnicos = Array.from(
          new Set(
            atendData
              .map((a) => (a?.enfermidade ? String(a.enfermidade).trim() : ''))
              .filter(Boolean)
          )
        );

        setEnfermidades(
          nomesUnicos.map((nome, i) => ({
            id: i + 1,
            nome,
          }))
        );
      } catch (e) {
        console.error('Erro ao carregar dados do relatório:', e);
        setEquino([]);
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

    carregar();
  }, []);

  useEffect(() => {
    const handleClickFora = (e) => {
      if (caixaEnfRef.current && !caixaEnfRef.current.contains(e.target)) {
        setAbrirSugestoes(false);
      }
    };

    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

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

  const formatarData = (data) => {
    if (!data) return '—';
    return new Date(`${String(data).slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR');
  };

  const gerarRelatorio = () => {
    const inicioDate = filtroInicio
      ? new Date(`${filtroInicio}T00:00:00`)
      : new Date('1970-01-01T00:00:00');

    const fimDate = filtroFim
      ? new Date(`${filtroFim}T23:59:59`)
      : new Date('9999-12-31T23:59:59');

    const equinosSelecionados = filtroEquino
      ? equino.filter((e) => String(e.id) === String(filtroEquino))
      : equino;

    const enfFiltro = (enfTexto || '').trim().toLowerCase();

    const dados = equinosSelecionados.map((eq) => {
      const atend = atendimentos
        .filter((a) => {
          const dataAt = new Date(`${String(a.data).slice(0, 10)}T12:00:00`);
          const dentro = dataAt >= inicioDate && dataAt <= fimDate;
          const doEquino = String(a.idEquino) === String(eq.id);
          const passaEnf = enfFiltro
            ? String(a.enfermidade || '').toLowerCase().includes(enfFiltro)
            : true;

          return dentro && doEquino && passaEnf;
        })
        .map((a) => {
          const meds = medicacoesAtendimento.filter((m) => {
            const dataMed = new Date(`${String(m.data).slice(0, 10)}T12:00:00`);
            const dentroPeriodo = dataMed >= inicioDate && dataMed <= fimDate;
            return (
              String(m.atendimentoId) === String(a.id) &&
              String(m.idEquino) === String(eq.id) &&
              dentroPeriodo
            );
          });

          return {
            ...a,
            medicacoes: meds,
          };
        });

      const vermif = vermifugacoes.filter((v) => {
        const dataVer = new Date(`${String(v.data).slice(0, 10)}T12:00:00`);
        return (
          String(v.equinoId) === String(eq.id) &&
          dataVer >= inicioDate &&
          dataVer <= fimDate
        );
      });

      const vacin = vacinacoes.filter((v) => {
        const dataVac = new Date(`${String(v.data).slice(0, 10)}T12:00:00`);
        return (
          (String(v.equinoId) === String(eq.id) || String(v.id_Eq) === String(eq.id)) &&
          dataVac >= inicioDate &&
          dataVac <= fimDate
        );
      });

      const esc = escalas.filter((s) => {
        const dataEsc = new Date(`${String(s.data).slice(0, 10)}T12:00:00`);
        return (
          String(s.idEquino) === String(eq.id) &&
          dataEsc >= inicioDate &&
          dataEsc <= fimDate
        );
      });

      const baixasEq = baixas.filter((b) => String(b.idEquino) === String(eq.id));
      let baixasFiltradas = [];
      let totalDiasBaixado = 0;

      baixasEq.forEach((b) => {
        const dataBaixa = new Date(`${String(b.dataBaixa).slice(0, 10)}T12:00:00`);
        const dataRetorno = b.dataRetorno
          ? new Date(`${String(b.dataRetorno).slice(0, 10)}T12:00:00`)
          : null;

        const sobrepoe =
          dataBaixa <= fimDate &&
          (dataRetorno ? dataRetorno >= inicioDate : true);

        if (sobrepoe) {
          const inicioPeriodo = dataBaixa < inicioDate ? inicioDate : dataBaixa;
          const fimPeriodo =
            dataRetorno && dataRetorno < fimDate ? dataRetorno : fimDate;

          const dias = Math.max(
            1,
            Math.ceil((fimPeriodo - inicioPeriodo) / (1000 * 60 * 60 * 24))
          );

          totalDiasBaixado += dias;

          baixasFiltradas.push({
            dataBaixa: formatarData(b.dataBaixa),
            dataRetorno: b.dataRetorno ? formatarData(b.dataRetorno) : '—',
            dias,
          });
        }
      });

      const cargaTotal = esc.reduce(
        (acc, item) => acc + (Number(item.cargaHoraria) || 0),
        0
      );

      const totalMedicacoes = atend.reduce(
        (acc, a) => acc + (a.medicacoes?.length || 0),
        0
      );

      return {
        equino: eq.nome,
        atendimentos: tiposAtivos.atendimentos ? atend : [],
        vermifugacoes: tiposAtivos.vermifugacoes ? vermif : [],
        vacinacoes: tiposAtivos.vacinacoes ? vacin : [],
        escalas: tiposAtivos.escalas ? esc : [],
        baixas: tiposAtivos.baixas ? baixasFiltradas : [],
        cargaTotal,
        totalAtendimentos: atend.length,
        totalMedicacoes,
        totalVermifugacoes: vermif.length,
        totalVacinacoes: vacin.length,
        totalBaixas: baixasFiltradas.length,
        totalDiasBaixado,
        totalEscalas: esc.length,
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

    const totalOcorr = enfFiltro
      ? dadosFiltrados.reduce((acc, d) => acc + d.totalAtendimentos, 0)
      : null;

    setResultado(dadosFiltrados);
    setTotalOcorrenciasEnf(totalOcorr);
  };

  const imprimir = () => window.print();

  const gerarPDF = () => {
    if (!divRef.current) return;

    const clone = divRef.current.cloneNode(true);

    const cabecalho = document.createElement('div');
    cabecalho.style.textAlign = 'center';
    cabecalho.style.marginBottom = '20px';

    const titulo = document.createElement('h2');
    titulo.innerText = 'Relatório de Equinos';
    titulo.style.color = '#0d6efd';
    cabecalho.appendChild(titulo);

    const filtros = document.createElement('p');
    filtros.style.fontSize = '14px';
    filtros.style.marginBottom = '10px';

    const periodoTexto = `Período: ${filtroInicio || 'S/D'} até ${filtroFim || 'S/D'}`;
    const equinoNome = filtroEquino
      ? equino.find((eq) => String(eq.id) === String(filtroEquino))?.nome || 'Desconhecido'
      : 'Todos';

    const tiposMarcados = Object.entries(tiposAtivos)
      .filter(([, ativo]) => ativo)
      .map(([chave]) => {
        if (chave === 'atendimentos') return 'Atendimentos';
        if (chave === 'medicacoes') return 'Medicações';
        if (chave === 'vermifugacoes') return 'Vermifugações';
        if (chave === 'vacinacoes') return 'Vacinações';
        if (chave === 'escalas') return 'Escalas';
        if (chave === 'baixas') return 'Baixas';
        return chave;
      })
      .join(', ');

    const enfHeader = enfTexto || 'Todas';

    const ocorrHeader =
      totalOcorrenciasEnf != null
        ? ` | Ocorrências de "${enfHeader}": ${totalOcorrenciasEnf}`
        : '';

    filtros.innerText = `${periodoTexto} | Equino: ${equinoNome} | Tipos: ${tiposMarcados} | Enfermidade: ${enfHeader}${ocorrHeader}`;
    cabecalho.appendChild(filtros);

    clone.prepend(cabecalho);

    const opt = {
      margin: 0.5,
      filename: 'relatorio_equinos.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(clone).save();
  };

  const emptyMsg = 'Nenhum resultado encontrado com os filtros informados.';

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <div className="relatorio-card shadow p-4 rounded-4 bg-white">
        <h2 className="mb-4 text-primary">Relatório de Equinos</h2>

        <div className="row g-2 align-items-end mb-3">
          <div className="col-6 col-md-2">
            <label className="form-label fw-bold">Período Inicial:</label>
            <input
              type="date"
              className="form-control"
              value={filtroInicio}
              onChange={(e) => setFiltroInicio(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label fw-bold">Período Final:</label>
            <input
              type="date"
              className="form-control"
              value={filtroFim}
              onChange={(e) => setFiltroFim(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label fw-bold">Equino:</label>
            <select
              className="form-select"
              value={filtroEquino}
              onChange={(e) => setFiltroEquino(e.target.value)}
            >
              <option value="">Todos</option>
              {equino.map((eq) => (
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
          <label className="form-label fw-bold d-block">Tipos de relatório:</label>
          <div className="d-flex flex-wrap gap-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="tipo-atendimentos"
                checked={tiposSelecionados.atendimentos}
                onChange={() => handleTipoChange('atendimentos')}
              />
              <label className="form-check-label" htmlFor="tipo-atendimentos">
                Atendimentos
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="tipo-medicacoes"
                checked={tiposSelecionados.medicacoes}
                onChange={() => handleTipoChange('medicacoes')}
              />
              <label className="form-check-label" htmlFor="tipo-medicacoes">
                Medicações
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="tipo-vermifugacoes"
                checked={tiposSelecionados.vermifugacoes}
                onChange={() => handleTipoChange('vermifugacoes')}
              />
              <label className="form-check-label" htmlFor="tipo-vermifugacoes">
                Vermifugações
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="tipo-vacinacoes"
                checked={tiposSelecionados.vacinacoes}
                onChange={() => handleTipoChange('vacinacoes')}
              />
              <label className="form-check-label" htmlFor="tipo-vacinacoes">
                Vacinações
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="tipo-escalas"
                checked={tiposSelecionados.escalas}
                onChange={() => handleTipoChange('escalas')}
              />
              <label className="form-check-label" htmlFor="tipo-escalas">
                Escalas
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="tipo-baixas"
                checked={tiposSelecionados.baixas}
                onChange={() => handleTipoChange('baixas')}
              />
              <label className="form-check-label" htmlFor="tipo-baixas">
                Baixas
              </label>
            </div>
          </div>
          {!algumTipoSelecionado && (
            <small className="text-muted">
              Nenhuma opção marcada. O sistema considerará todos os tipos.
            </small>
          )}
        </div>

        <div className="d-flex justify-content-end gap-3 mb-3">
          <button className="btn btn-outline-danger" onClick={() => navigate(-1)}>
            Voltar
          </button>
          <button className="btn btn-success" onClick={gerarRelatorio}>
            Gerar Relatório
          </button>
          <button className="btn btn-outline-primary d-print-none" onClick={imprimir}>
            Imprimir
          </button>
          <button className="btn btn-outline-secondary d-print-none" onClick={gerarPDF}>
            Gerar PDF
          </button>
        </div>

        {totalOcorrenciasEnf != null && (
          <div className="alert alert-info">
            Ocorrências de <strong>"{enfTexto}"</strong>: <strong>{totalOcorrenciasEnf}</strong>
          </div>
        )}

        {resultado && resultado.length > 0 && (
          <div ref={divRef} className="relatorio-result mt-4">
            {resultado.map((r, index) => (
              <div key={index} className="relatorio-bloco mb-5 p-4 border rounded shadow-sm">
                <h4 className="mb-3">{r.equino}</h4>

                {enfTexto.trim() && (
                  <p>
                    <strong>Ocorrências da enfermidade:</strong> {r.totalAtendimentos}
                  </p>
                )}

                <div className="mb-3">
                  {tiposAtivos.atendimentos && (
                    <p><strong>Total de Atendimentos:</strong> {r.totalAtendimentos}</p>
                  )}
                  {tiposAtivos.medicacoes && (
                    <p><strong>Total de Medicações:</strong> {r.totalMedicacoes}</p>
                  )}
                  {tiposAtivos.vermifugacoes && (
                    <p><strong>Total de Vermifugações:</strong> {r.totalVermifugacoes}</p>
                  )}
                  {tiposAtivos.vacinacoes && (
                    <p><strong>Total de Vacinações:</strong> {r.totalVacinacoes}</p>
                  )}
                  {tiposAtivos.baixas && (
                    <>
                      <p><strong>Total de Baixas:</strong> {r.totalBaixas}</p>
                      <p><strong>Total de Dias Baixado:</strong> {r.totalDiasBaixado}</p>
                    </>
                  )}
                  {tiposAtivos.escalas && (
                    <>
                      <p><strong>Total de Escalas:</strong> {r.totalEscalas}</p>
                      <p><strong>Total de Carga Horária:</strong> {r.cargaTotal}h</p>
                    </>
                  )}
                </div>

                {r.atendimentos.length > 0 && (
                  <>
                    <h5 className="mt-3">Atendimentos</h5>
                    <ul>
                      {r.atendimentos.map((a, i) => (
                        <li key={i} className="mb-2">
                          <div>
                            <strong>{formatarData(a.data)}</strong> - {a.textoConsulta}
                            {a.enfermidade ? ` — Enfermidade: ${a.enfermidade}` : ''}
                          </div>

                          {tiposAtivos.medicacoes && a.medicacoes?.length > 0 && (
                            <ul className="mt-1">
                              {a.medicacoes.map((m, j) => (
                                <li key={j}>
                                  <strong>Medicação:</strong> {m.nomeMedicamento || '—'} |{' '}
                                  <strong>Dose:</strong> {m.doseAplicada ?? '—'} {m.unidade || ''} |{' '}
                                  <strong>Origem:</strong> {m.origem || '—'}
                                  {m.observacao ? ` | Obs.: ${m.observacao}` : ''}
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {r.vermifugacoes.length > 0 && (
                  <>
                    <h5 className="mt-3">Vermifugações</h5>
                    <ul>
                      {r.vermifugacoes.map((v, i) => (
                        <li key={i}>
                          <strong>{formatarData(v.data)}</strong> - {v.vermifugo || '—'}
                          {v.dataProximoProcedimento
                            ? ` | Próximo procedimento: ${formatarData(v.dataProximoProcedimento)}`
                            : ''}
                          {v.observacao ? ` | Obs.: ${v.observacao}` : ''}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {r.vacinacoes.length > 0 && (
                  <>
                    <h5 className="mt-3">Vacinações</h5>
                    <ul>
                      {r.vacinacoes.map((v, i) => (
                        <li key={i}>
                          <strong>{formatarData(v.data)}</strong> - {v.nomeVacina || '—'}
                          {v.dataProximoProcedimento
                            ? ` | Próxima dose: ${formatarData(v.dataProximoProcedimento)}`
                            : ''}
                          {v.observacao ? ` | Obs.: ${v.observacao}` : ''}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {r.baixas.length > 0 && (
                  <>
                    <h5 className="mt-3">Baixas</h5>
                    <ul>
                      {r.baixas.map((b, i) => (
                        <li key={i}>
                          Baixado em {b.dataBaixa}, retornou em {b.dataRetorno} ({b.dias} dias)
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {r.escalas.length > 0 && (
                  <>
                    <h5 className="mt-3">Escalas</h5>
                    <ul>
                      {r.escalas.map((s, i) => (
                        <li key={i}>
                          {formatarData(s.data)} - {s.localTrabalho}, {s.jornadaTrabalho},{' '}
                          Cavaleiro: {s.cavaleiro}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {resultado && resultado.length === 0 && (
          <div className="alert alert-warning mt-3">{emptyMsg}</div>
        )}
      </div>
    </div>
  );
};

export default VeterinariaRelatorioEquino;
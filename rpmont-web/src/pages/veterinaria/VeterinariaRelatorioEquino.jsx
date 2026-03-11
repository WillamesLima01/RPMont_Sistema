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
  const [escalas, setEscalas] = useState([]);
  const [baixas, setBaixas] = useState([]);

  // === Enfermidades (autocomplete para filtro) ===
  const [enfermidades, setEnfermidades] = useState([]); // [{id, nome}]
  const [enfTexto, setEnfTexto] = useState('');
  const [abrirSugestoes, setAbrirSugestoes] = useState(false);
  const [carregandoEnf, setCarregandoEnf] = useState(false);
  const caixaEnfRef = useRef(null);
  const blurTimer = useRef(null);

  const [filtroEquino, setFiltroEquino] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [tipoRelatorio, setTipoRelatorio] = useState('completo');

  const [resultado, setResultado] = useState(null);
  const [totalOcorrenciasEnf, setTotalOcorrenciasEnf] = useState(null);
  const divRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregandoEnf(true);

        const [eq, at, es, bx] = await Promise.all([
          axios.get('/equino'),
          axios.get('/atendimentos'),
          axios.get('/escala'),
          axios.get('/equinosBaixados'),
        ]);

        const equinoData = eq.data || [];
        const atendData = at.data || [];
        const escalasData = es.data || [];
        const baixasData = bx.data || [];

        setEquino(equinoData);
        setAtendimentos(atendData);
        setEscalas(escalasData);
        setBaixas(baixasData);

        const nomesUnicos = Array.from(
          new Set(
            atendData
              .map((a) => (a && a.enfermidade ? String(a.enfermidade).trim() : ''))
              .filter(Boolean)
          )
        );

        const lista = nomesUnicos.map((nome, i) => ({
          id: i + 1,
          nome,
        }));

        setEnfermidades(lista);
      } catch (e) {
        console.error('Erro ao carregar dados do relatório:', e);
        setEquino([]);
        setAtendimentos([]);
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

  const gerarRelatorio = () => {
    const inicioDate = filtroInicio ? new Date(`${filtroInicio}T00:00:00`) : new Date('1970-01-01T00:00:00');
    const fimDate = filtroFim ? new Date(`${filtroFim}T23:59:59`) : new Date('9999-12-31T23:59:59');

    const equinosSelecionados = filtroEquino
      ? equino.filter((e) => String(e.id) === String(filtroEquino))
      : equino;

    const enfFiltro = (enfTexto || '').trim().toLowerCase();

    const dados = equinosSelecionados.map((eq) => {
      const atend = atendimentos.filter((a) => {
        const dataAt = new Date(a.data);
        const dentro = dataAt >= inicioDate && dataAt <= fimDate;
        const doEquino = String(a.idEquino) === String(eq.id);
        const passaEnf = enfFiltro
          ? String(a.enfermidade || '').toLowerCase().includes(enfFiltro)
          : true;

        return dentro && doEquino && passaEnf;
      });

      const esc = escalas.filter((s) => {
        const dataEsc = new Date(s.data);
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
        const dataBaixa = new Date(b.dataBaixa);
        const dataRetorno = b.dataRetorno ? new Date(b.dataRetorno) : null;

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
            dataBaixa: dataBaixa.toLocaleDateString('pt-BR'),
            dataRetorno: dataRetorno
              ? dataRetorno.toLocaleDateString('pt-BR')
              : '—',
            dias,
          });
        }
      });

      const cargaTotal = esc.reduce(
        (acc, item) => acc + (Number(item.cargaHoraria) || 0),
        0
      );

      return {
        equino: eq.nome,
        atendimentos:
          tipoRelatorio !== 'baixas' && tipoRelatorio !== 'escalas' ? atend : [],
        escalas:
          tipoRelatorio !== 'atendimentos' && tipoRelatorio !== 'baixas'
            ? esc
            : [],
        baixas:
          tipoRelatorio !== 'atendimentos' && tipoRelatorio !== 'escalas'
            ? baixasFiltradas
            : [],
        cargaTotal,
        totalAtendimentos: atend.length,
        totalBaixas: baixasFiltradas.length,
        totalDiasBaixado,
        totalEscalas: esc.length,
      };
    });

    let dadosFiltrados;
    switch (tipoRelatorio) {
      case 'baixas':
        dadosFiltrados = dados.filter((d) => d.totalBaixas > 0);
        break;
      case 'escalas':
        dadosFiltrados = dados.filter((d) => d.totalEscalas > 0);
        break;
      case 'atendimentos':
        dadosFiltrados = dados.filter((d) => d.totalAtendimentos > 0);
        break;
      default:
        dadosFiltrados = dados.filter(
          (d) =>
            d.totalAtendimentos > 0 ||
            d.totalBaixas > 0 ||
            d.totalEscalas > 0
        );
    }

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
    const tipoTexto = tipoRelatorio.charAt(0).toUpperCase() + tipoRelatorio.slice(1);
    const enfHeader = enfTexto || 'Todas';

    const ocorrHeader =
      totalOcorrenciasEnf != null
        ? ` | Ocorrências de "${enfHeader}": ${totalOcorrenciasEnf}`
        : '';

    filtros.innerText = `${periodoTexto} | Equino: ${equinoNome} | Tipo: ${tipoTexto} | Enfermidade: ${enfHeader}${ocorrHeader}`;
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

  const emptyMsg =
    {
      atendimentos: 'Nenhum atendimento encontrado com os filtros informados.',
      baixas: 'Nenhuma baixa encontrada com os filtros informados.',
      escalas: 'Nenhuma escala encontrada com os filtros informados.',
      completo: 'Nenhum resultado encontrado com os filtros informados.',
    }[tipoRelatorio] || 'Nenhum resultado encontrado com os filtros informados.';

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

          <div className="col-6 col-md-2">
            <label className="form-label fw-bold">Tipo de Relatório:</label>
            <select
              className="form-select"
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
            >
              <option value="completo">Completo</option>
              <option value="atendimentos">Somente Atendimentos</option>
              <option value="baixas">Somente Baixas</option>
              <option value="escalas">Somente Escalas</option>
            </select>
          </div>

          <div className="col-12 col-md-4" ref={caixaEnfRef}>
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
            Ocorrências de <strong>"{enfTexto}"</strong>:{' '}
            <strong>{totalOcorrenciasEnf}</strong>
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

                {tipoRelatorio === 'completo' && (
                  <>
                    <p><strong>Total de Atendimentos:</strong> {r.totalAtendimentos}</p>
                    <p><strong>Total de Baixas:</strong> {r.totalBaixas}</p>
                    <p><strong>Total de Dias Baixado:</strong> {r.totalDiasBaixado}</p>
                    <p><strong>Total de Carga Horária:</strong> {r.cargaTotal}h</p>
                    <p><strong>Total de Escalas:</strong> {r.totalEscalas}</p>
                  </>
                )}

                {tipoRelatorio === 'atendimentos' && (
                  <p><strong>Total de Atendimentos:</strong> {r.totalAtendimentos}</p>
                )}

                {tipoRelatorio === 'baixas' && (
                  <>
                    <p><strong>Total de Baixas:</strong> {r.totalBaixas}</p>
                    <p><strong>Total de Dias Baixado:</strong> {r.totalDiasBaixado}</p>
                  </>
                )}

                {tipoRelatorio === 'escalas' && (
                  <>
                    <p><strong>Total de Escalas:</strong> {r.totalEscalas}</p>
                    <p><strong>Total de Carga Horária:</strong> {r.cargaTotal}h</p>
                  </>
                )}

                {r.atendimentos.length > 0 && (
                  <>
                    <h5 className="mt-3">Atendimentos</h5>
                    <ul>
                      {r.atendimentos.map((a, i) => (
                        <li key={i}>
                          {new Date(a.data).toLocaleDateString('pt-BR')} - {a.textoConsulta}
                          {a.enfermidade ? ` — Enfermidade: ${a.enfermidade}` : ''}
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
                          {new Date(s.data).toLocaleDateString('pt-BR')} - {s.localTrabalho},{' '}
                          {s.jornadaTrabalho}, Cavaleiro: {s.cavaleiro}
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
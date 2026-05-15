// src/pages/veterinaria/GraficoCargaHorariaEquinoAnual.jsx
import React, { useEffect, useRef, useState } from 'react';
import anychart from 'anychart';
import 'anychart/dist/css/anychart-ui.min.css';
import 'anychart/dist/fonts/css/anychart-font.min.css';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import { useNavigate } from 'react-router-dom';
import './GraficoCargaHorariaEquino.css';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ModalGraficoCargaHorariaEquinoAnualUnico
  from '../../components/modal/ModalGraficoCargaHorariaEquinoAnualUnico.jsx';

// Meses (labels completas para barras e curtas para linha)
const MESES = [
  { num: '01', nome: 'Janeiro',  short: 'Jan' },
  { num: '02', nome: 'Fevereiro',short: 'Fev' },
  { num: '03', nome: 'Março',    short: 'Mar' },
  { num: '04', nome: 'Abril',    short: 'Abr' },
  { num: '05', nome: 'Maio',     short: 'Mai' },
  { num: '06', nome: 'Junho',    short: 'Jun' },
  { num: '07', nome: 'Julho',    short: 'Jul' },
  { num: '08', nome: 'Agosto',   short: 'Ago' },
  { num: '09', nome: 'Setembro', short: 'Set' },
  { num: '10', nome: 'Outubro',  short: 'Out' },
  { num: '11', nome: 'Novembro', short: 'Nov' },
  { num: '12', nome: 'Dezembro', short: 'Dez' },
];

// 12 cores — uma por mês (linha multicolor e também usada nas barras)
const MESES_CORES = [
  '#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4',
  '#22c55e','#f97316','#a855f7','#0ea5e9','#84cc16','#e11d48'
];

const GraficoCargaHorariaEquinoAnual = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [anosDisponiveis, setAnosDisponiveis] = useState([]);
  const [anoSelecionado, setAnoSelecionado] = useState('');

  const [equinos, setEquinos] = useState([]);
  const [equinosById, setEquinosById] = useState({});

  const [snapshotAnual, setSnapshotAnual] = useState([]); // usado no PDF detalhado
  const [modalAberto, setModalAberto] = useState(false);

  // 👉 Começa em LINHAS por padrão (como você pediu)
  const [modoLinha, setModoLinha] = useState(true);

  const navigate = useNavigate();

  /* ===== Helpers ===== */
  const agruparAno = (escalas, byId, ano) => {
    const base = {};
  
    for (const mes of MESES) {
      base[mes.num] = {
        total: 0,
        porEquino: new Map(),
      };
    }
  
    for (const escala of escalas || []) {
      const dataEscala =
        escala.dataCadastro ??
        escala.data ??
        null;
  
      if (!dataEscala) continue;
  
      const dataTexto = String(dataEscala);
  
      if (!dataTexto.startsWith(ano)) continue;
  
      const mes = dataTexto.slice(5, 7);
  
      if (!base[mes]) continue;
  
      const horas = Number(escala.cargaHoraria || 0) || 0;
  
      base[mes].total += horas;
  
      const equinoId =
        escala.equino?.id ??
        escala.equinoId ??
        escala.idEquino ??
        null;
  
      if (!equinoId) continue;
  
      const equinoIdTexto = String(equinoId);
  
      base[mes].porEquino.set(
        equinoIdTexto,
        (base[mes].porEquino.get(equinoIdTexto) || 0) + horas
      );
    }
  
    return MESES.map((mes, index) => {
      const total = base[mes.num].total || 0;
  
      const top3 = Array.from(base[mes.num].porEquino.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([idEquino, horas]) => ({
          nome: byId[idEquino] ?? `#${idEquino}`,
          horas,
        }));
  
      return {
        mesNum: mes.num,
        mesNome: mes.nome,
        mesShort: mes.short,
        total,
        top3,
        cor: MESES_CORES[index],
      };
    });
  };

  /* ===== Desenha o gráfico (barras OU linhas) ===== */
  const montarGraficoAnual = (escalas, byId, ano, usarLinha=false) => {
    if (!chartRef.current) return;
    chartRef.current.innerHTML = '';

    const serie = agruparAno(escalas, byId, ano);

    // snapshot para PDF detalhado
    setSnapshotAnual(
      serie.map(s => ({ mes: s.mesNome, total: s.total, top3: s.top3 }))
    );

    const chart = usarLinha ? anychart.line() : anychart.column();
    chart.animation(true);
    chart.title(`Carga Horária Anual — ${ano}`);
    chart.background().fill('#f9f9fc');

    // Eixos e labels
    chart.xAxis().title('Meses do ano');
    chart.yAxis().title('Carga horária (h)');
    chart.yScale().minimum(0);

    // Rótulos dos meses inclinados (mais legível)
    chart.xAxis().labels()
      .rotation(-45)
      .padding(5, 0, 0, 0)
      .wordWrap('break-word');

    // Grade + crosshair como no exemplo
    chart.xGrid().enabled(true).drawFirstLine(false).drawLastLine(false);
    chart.yGrid().enabled(true).stroke({ color: '#e5e7eb', thickness: 1, dash: '2 2' });
    chart.crosshair()
      .enabled(true)
      .yStroke('#9ca3af', 1, '2 2')
      .xStroke('#9ca3af', 1, '2 2')
      .displayMode('float');

    chart.interactivity().hoverMode('by-x');

    // pontos (um por mês)
    const points = serie.map(s => ({
      x: usarLinha ? s.mesShort : s.mesNome,
      value: s.total,
      stroke: s.cor,  // cor da linha (linha)
      fill: s.cor,    // cor da barra (barras)
      _top3: s.top3,  // tooltip
    }));

    const dataSet = anychart.data.set(points);
    const mapping = dataSet.mapAs({ x: 'x', value: 'value' });

    const series = chart[usarLinha ? 'line' : 'column'](mapping);

    // Tooltip com top-3
    chart.tooltip().useHtml(true);
    chart.tooltip().titleFormat('{%X}');
    chart.tooltip().format(function() {
      const top = this.getData('_top3') || [];
      const linhas = top.map((t,i)=>`${i+1}. ${t.nome}: ${t.horas}h`).join('<br/>');
      return `
        <div><b>Total:</b> ${this.value}h</div>
        <div style="margin-top:6px">
          <b>Top 3 equinos</b><br/>
          ${linhas || '<em>Sem dados</em>'}
        </div>
      `;
    });

    if (usarLinha) {
      // Marcadores e linha grossa com cor por ponto/segmento
      series.markers(true)
        .type('circle')
        .size(6)
        .stroke('#ffffff', 1)
        .fill(function() { return this.getData('fill') || '#2563eb'; });

      series.normal().stroke(function () {
        const color = this.getData('stroke') || '#2563eb';
        return { color, thickness: 3.5, lineJoin: 'round', lineCap: 'round' };
      });
      series.hovered().stroke(function () {
        const color = this.getData('stroke') || '#2563eb';
        return { color, thickness: 5, lineJoin: 'round', lineCap: 'round' };
      });
    } else {
      // Barras coloridas por mês + rótulo superior
      series.color(function(){ return this.getData('fill') || '#2563eb'; });
      series.labels()
        .enabled(true)
        .position('outside-top')
        .anchor('center-bottom')
        .format('{%Value}h');
    }

    chart.container(chartRef.current);
    chart.draw();
    chartInstanceRef.current = chart;
  };

  /* ===== Effects ===== */
  useEffect(() => {
    (async () => {
      try {
        const [resEscala, resEquinos] = await Promise.all([
          axios.get('/escala'),
          axios.get('/equino'),
        ]);
  
        const listaEquinos = resEquinos.data || [];
        const listaEscalas = resEscala.data || [];
  
        setEquinos(listaEquinos);
  
        const byId = {};
  
        for (const equino of listaEquinos) {
          byId[equino.id] =
            equino.name ||
            equino.nome ||
            `#${equino.id}`;
        }
  
        setEquinosById(byId);
  
        const anos = Array.from(
          new Set(
            listaEscalas
              .map((escala) => {
                const dataEscala =
                  escala.dataCadastro ??
                  escala.data ??
                  null;
  
                return dataEscala
                  ? String(dataEscala).slice(0, 4)
                  : '';
              })
              .filter(Boolean)
          )
        ).sort();
  
        const anoPadrao =
          anos[anos.length - 1] ||
          String(new Date().getFullYear());
  
        setAnosDisponiveis(anos);
        setAnoSelecionado(anoPadrao);
  
        montarGraficoAnual(
          listaEscalas,
          byId,
          anoPadrao,
          modoLinha
        );
      } catch (error) {
        console.error('Erro ao carregar gráfico anual:', error);
      }
    })();
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (!anoSelecionado) return;
  
    Promise.all([
      axios.get('/escala'),
      axios.get('/equino'),
    ])
      .then(([resEscala, resEquinos]) => {
        const listaEquinos = resEquinos.data || [];
        const listaEscalas = resEscala.data || [];
  
        const byId = {};
  
        for (const equino of listaEquinos) {
          byId[equino.id] =
            equino.name ||
            equino.nome ||
            `#${equino.id}`;
        }
  
        setEquinos(listaEquinos);
        setEquinosById(byId);
  
        montarGraficoAnual(
          listaEscalas,
          byId,
          anoSelecionado,
          modoLinha
        );
      })
      .catch((error) => {
        console.error('Erro ao atualizar gráfico anual:', error);
      });
  }, [anoSelecionado, modoLinha]);

  /* ===== PDF detalhado (com top-3 de cada mês) ===== */
  const gerarPdfDetalhado = () => {
    if (!anoSelecionado) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const margem = 40;
    doc.setFontSize(16);
    doc.text(`Carga Horária Anual — ${anoSelecionado}`, margem, 32);
    const head = [['Mês', 'Total (h)', 'Top 1', 'Top 2', 'Top 3']];
    const body = snapshotAnual.map(({ mes, total, top3 }) => {
      const t1 = top3[0] ? `${top3[0].nome} (${top3[0].horas}h)` : '—';
      const t2 = top3[1] ? `${top3[1].nome} (${top3[1].horas}h)` : '—';
      const t3 = top3[2] ? `${top3[2].nome} (${top3[2].horas}h)` : '—';
      return [mes, String(total), t1, t2, t3];
    });
    autoTable(doc, {
      head, body, startY: 52,
      styles: { fontSize: 10, cellPadding: 6, overflow: 'linebreak' },
      headStyles: { fillColor: [33, 150, 243] },
      margin: { left: margem, right: margem },
    });
    doc.save(`carga-horaria-anual-${anoSelecionado}.pdf`);
  };

  /* ===== Modal Equino específico ===== */
  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => setModalAberto(false);
  const confirmarModal = (ano, equinoId) => {
    setModalAberto(false);
    navigate('/grafico-carga-horaria-equino-anual-unico', {
      state: { equinoId, ano },
    });
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />
      <div className="carga-container">
        <div className="cabecalho-carga d-flex align-items-center flex-wrap gap-3 mb-4">
          <h2 className="titulo-principal flex-grow-1 mb-0">Carga Horária Anual</h2>

          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0">Ano:</label>
            <select
              className="form-select w-auto"
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
            >
              <option value="">Selecione o ano...</option>
              {anosDisponiveis.map((ano) => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>

            <button className="btn btn-outline-primary ms-2" onClick={abrirModal}>
              Ver Equino específico
            </button>
          </div>

          <div className="d-flex gap-2 justify-content-center flex-grow-1">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setModoLinha(v => !v)}
              title="Alternar entre barras e linhas"
            >
              {modoLinha ? 'Ver em Barras' : 'Ver em Linhas'}
            </button>

            <button className="btn btn-outline-success" onClick={() => chartInstanceRef.current?.print()}>
              Imprimir Gráfico
            </button>
            <button className="btn btn-outline-secondary" onClick={() => chartInstanceRef.current?.saveAsPdf()}>
              Gerar PDF (gráfico)
            </button>
            <button className="btn btn-outline-danger" onClick={gerarPdfDetalhado}>
              PDF Detalhado (tooltips)
            </button>
            <button className="btn btn-outline-warning" onClick={() => chartInstanceRef.current?.saveAsPng()}>
              Salvar PNG
            </button>
          </div>
        </div>

        {/* Legenda das faixas (só faz sentido para barras) */}
        {!modoLinha && (
          <div className="legenda-carga mb-3">
            <span className="badge" style={{ backgroundColor: '#5cb85c' }}>51-150h</span>
            <span className="badge" style={{ backgroundColor: '#9370DB' }}>151-300h</span>
            <span className="badge" style={{ backgroundColor: '#ffa500' }}>301-450h</span>
            <span className="badge" style={{ backgroundColor: '#20c997' }}>451-600h</span>
            <span className="badge" style={{ backgroundColor: '#1e90ff' }}>+600h</span>
          </div>
        )}

        <div ref={chartRef} className="chart-container" />
      </div>

      {/* Modal de seleção Ano + Equino */}
      <ModalGraficoCargaHorariaEquinoAnualUnico
        isOpen={modalAberto}
        onClose={fecharModal}
        anos={anosDisponiveis}
        equinos={equinos}
        defaultAno={anoSelecionado}
        defaultEquinoId={equinos[0]?.id ?? ''}
        onConfirm={confirmarModal}
      />
    </div>
  );
};

export default GraficoCargaHorariaEquinoAnual;

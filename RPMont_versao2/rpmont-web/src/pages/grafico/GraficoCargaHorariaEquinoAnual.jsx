import React, { useEffect, useRef, useState } from 'react';
import anychart from 'anychart';
import 'anychart/dist/css/anychart-ui.min.css';
import 'anychart/dist/fonts/css/anychart-font.min.css';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import { useNavigate } from 'react-router-dom';
import './GraficoCargaHorariaEquino.css';

const MESES = [
  { num: '01', nome: 'Janeiro' },
  { num: '02', nome: 'Fevereiro' },
  { num: '03', nome: 'Março' },
  { num: '04', nome: 'Abril' },
  { num: '05', nome: 'Maio' },
  { num: '06', nome: 'Junho' },
  { num: '07', nome: 'Julho' },
  { num: '08', nome: 'Agosto' },
  { num: '09', nome: 'Setembro' },
  { num: '10', nome: 'Outubro' },
  { num: '11', nome: 'Novembro' },
  { num: '12', nome: 'Dezembro' },
];

const GraficoCargaHorariaEquinoAnual = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [anosDisponiveis, setAnosDisponiveis] = useState([]);
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [equinosById, setEquinosById] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const [resEscala, resEquinos] = await Promise.all([
        axios.get('/escala'),
        axios.get('/equinos'),
      ]);

      // índice rápido id->nome
      const byId = {};
      for (const eq of resEquinos.data || []) byId[eq.id] = eq.name || eq.nome || `#${eq.id}`;
      setEquinosById(byId);

      const anos = Array.from(
        new Set((resEscala.data || []).map(e => (e.data || '').slice(0, 4)).filter(Boolean))
      ).sort();
      setAnosDisponiveis(anos);

      const anoPadrao = anos[anos.length - 1] || String(new Date().getFullYear());
      setAnoSelecionado(anoPadrao);

      montarGrafico(resEscala.data || [], byId, anoPadrao);
    })();
  }, []);

  useEffect(() => {
    if (!anoSelecionado) return;
    Promise.all([axios.get('/escala'), axios.get('/equinos')]).then(([resEscala, resEquinos]) => {
      const byId = {};
      for (const eq of resEquinos.data || []) byId[eq.id] = eq.name || eq.nome || `#${eq.id}`;
      setEquinosById(byId);
      montarGrafico(resEscala.data || [], byId, anoSelecionado);
    });
  }, [anoSelecionado]);

  const somarPorMesEEquino = (escalas, ano) => {
    // mapa: { MM: { total: number, porEquino: Map<id, soma> } }
    const base = {};
    for (const { num } of MESES) base[num] = { total: 0, porEquino: new Map() };

    for (const esc of escalas) {
      const data = esc.data || '';
      if (!data.startsWith(ano)) continue; // mantém só do ano
      const mes = data.slice(5, 7);
      if (!base[mes]) continue;

      const horas = Number(esc.cargaHoraria || 0) || 0;
      base[mes].total += horas;

      const id = String(esc.idEquino);
      base[mes].porEquino.set(id, (base[mes].porEquino.get(id) || 0) + horas);
    }
    return base;
  };

  const montarGrafico = (escalas, byId, ano) => {
    if (!chartRef.current) return;
    chartRef.current.innerHTML = '';

    const agreg = somarPorMesEEquino(escalas, ano);

    // prepara dados para o gráfico: um ponto por mês (jan..dez) — mesmo que zero
    const dados = MESES.map(({ num, nome }) => {
      const total = agreg[num].total || 0;

      // top-3 equinos do mês
      const top3 = Array.from(agreg[num].porEquino.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([idEq, horas]) => `${byId[idEq] ?? `#${idEq}`} — ${horas}h`);

      // cor por faixas (opcional)
      let fill = '#d9edf7';
      if (total > 50 && total <= 150) fill = '#5cb85c';
      else if (total > 150 && total <= 300) fill = '#9370DB';
      else if (total > 300 && total <= 450) fill = '#ffa500';
      else if (total > 450 && total <= 600) fill = '#20c997';
      else if (total > 600) fill = '#1e90ff';

      return {
        x: nome,
        value: total,
        fill,
        top3Text: top3.length ? top3.join('<br/>') : 'Sem destaques no mês',
      };
    });

    const chart = anychart.column();
    chart.animation(true);
    chart.title(`Carga Horária Anual — ${ano}`);
    chart.background().fill('#f9f9fc');

    const dataSet = anychart.data.set(dados);
    const series = chart.column(dataSet.mapAs({ x: 'x', value: 'value', fill: 'fill' }));

    chart.labels().enabled(true).position('outside-top').anchor('center-bottom').format('{%Value}h');

    chart.yAxis().title('Horas no mês (soma de todos os equinos)');
    chart.xAxis().title('Meses do ano').labels().enabled(true);
    chart.yScale().minimum(0);

    chart.interactivity().hoverMode('by-x');
    chart.tooltip().useHtml(true).positionMode('point').titleFormat('{%x}');
    chart.tooltip().format(function () {
      // usa campo customizado
      const total = this.getData('value');
      const top3 = this.getData('top3Text');
      return `<div><b>Total:</b> ${total}h</div><div style="margin-top:6px"><b>Top 3 equinos:</b><br/>${top3}</div>`;
    });

    chart.container(chartRef.current);
    chart.draw();

    chartInstanceRef.current = chart;
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />
      <div className="carga-container">
        <div className="cabecalho-carga d-flex align-items-center flex-wrap gap-3 mb-4">
          <h2 className="titulo-principal flex-grow-1 mb-0">Carga Horária Anual</h2>

          <div className="d-flex gap-2 justify-content-center flex-grow-1">
            <button className="btn btn-secondary" onClick={() => navigate('/grafico-carga-horaria-equino')}>
              Voltar ao Mensal
            </button>
            <button className="btn btn-primary" onClick={() => chartInstanceRef.current?.print()}>
              Imprimir Gráfico
            </button>
            <button className="btn btn-outline-secondary" onClick={() => chartInstanceRef.current?.saveAsPdf()}>
              Gerar PDF
            </button>
            <button className="btn btn-outline-success" onClick={() => chartInstanceRef.current?.saveAsPng()}>
              Salvar PNG
            </button>
          </div>

          <div className="filtro-mes">
            <label className="form-label me-2 mb-0">Ano:</label>
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
          </div>
        </div>

        <div className="legenda-carga mb-3">
          <span className="badge" style={{ backgroundColor: '#5cb85c' }}>51-150h</span>
          <span className="badge" style={{ backgroundColor: '#9370DB' }}>151-300h</span>
          <span className="badge" style={{ backgroundColor: '#ffa500' }}>301-450h</span>
          <span className="badge" style={{ backgroundColor: '#20c997' }}>451-600h</span>
          <span className="badge" style={{ backgroundColor: '#1e90ff' }}>+600h</span>
        </div>

        <div ref={chartRef} className="chart-container" />
      </div>
    </div>
  );
};

export default GraficoCargaHorariaEquinoAnual;

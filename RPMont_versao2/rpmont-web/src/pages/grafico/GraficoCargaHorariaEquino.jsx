// src/pages/veterinaria/GraficoCargaHorariaEquino.jsx
import React, { useEffect, useRef, useState } from 'react';
import anychart from 'anychart';
import 'anychart/dist/css/anychart-ui.min.css';
import 'anychart/dist/fonts/css/anychart-font.min.css';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import './GraficoCargaHorariaEquino.css';
import { useNavigate } from 'react-router-dom';

const mesesExtenso = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
};

const GraficoCargaHorariaEquino = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [meses, setMeses] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const carregarDados = async () => {
      const [resEscala, resEquinos] = await Promise.all([
        axios.get('/escala'),
        axios.get('/equinos'),
      ]);

      const escalas = resEscala.data || [];
      const equinos = resEquinos.data || [];

      const mesesSet = new Set();
      escalas.forEach(esc => {
        const mes = (esc.data || '').slice(0, 7); // YYYY-MM
        if (mes) mesesSet.add(mes);
      });

      const mesesArray = Array.from(mesesSet).sort();
      setMeses(mesesArray);

      // Se houver dados, define o último mês como padrão e monta o gráfico
      if (mesesArray.length > 0) {
        const mesPadrao = mesesArray[mesesArray.length - 1];
        setMesSelecionado(mesPadrao);
        montarGrafico(escalas, equinos, mesPadrao);
      } else {
        // limpa o container se não houver dados
        if (chartRef.current) chartRef.current.innerHTML = '';
      }
    };

    carregarDados();
  }, []);

  useEffect(() => {
    if (mesSelecionado) {
      Promise.all([axios.get('/escala'), axios.get('/equinos')])
        .then(([resEscala, resEquinos]) => {
          montarGrafico(resEscala.data || [], resEquinos.data || [], mesSelecionado);
        });
    }
  }, [mesSelecionado]);

  const montarGrafico = (escalas, equinos, mes) => {
    if (!chartRef.current) return;
    chartRef.current.innerHTML = '';

    const escalasFiltradas = (escalas || []).filter(esc => (esc.data || '').startsWith(mes));
    const equinoIds = [...new Set(escalasFiltradas.map(esc => esc.idEquino))];
    const equinosFiltrados = (equinos || []).filter(eq => equinoIds.includes(eq.id));

    if (equinosFiltrados.length === 0) {
      // Sem dados no mês selecionado
      const div = document.createElement('div');
      div.className = 'p-3 text-center text-muted';
      div.innerText = 'Não há registros de carga horária para o mês selecionado.';
      chartRef.current.appendChild(div);
      chartInstanceRef.current = null;
      return;
    }

    const dados = equinosFiltrados.map(eq => {
      const total = escalasFiltradas
        .filter(esc => esc.idEquino === eq.id)
        .reduce((acc, esc) => acc + Number(esc.cargaHoraria || 0), 0);

      let cor = '#d9edf7';
      if (total > 30 && total <= 60) cor = '#5cb85c';
      else if (total > 60 && total <= 90) cor = '#9370DB';
      else if (total > 90 && total <= 120) cor = '#ffa500';
      else if (total > 120 && total <= 150) cor = '#20c997';
      else if (total > 150 && total <= 180) cor = '#1e90ff';
      else if (total > 180) cor = '#dc3545';

      return { x: eq.name, value: total, fill: cor };
    });

    const chart = anychart.column();
    chart.animation(true);

    const [, mesNum] = mes.split('-');
    const nomeMes = mesesExtenso[mesNum] || mes;

    chart.title(`Carga Horária - ${nomeMes}`);
    const dataSet = anychart.data.set(dados);
    const mapping = dataSet.mapAs({ x: 'x', value: 'value', fill: 'fill' });
    chart.column(mapping);

    chart.labels().enabled(true).position('outside-top').anchor('center-bottom').format('{%Value}h');
    chart.yScale().minimum(0).maximum(180).ticks({ interval: 30 });
    chart.tooltip().positionMode('point').format('Carga Horária: {%Value}h');
    chart.interactivity().hoverMode('by-x');
    chart.yAxis().title('Horas (limite: 180h/mês)');
    chart.xAxis().title('Equinos').labels().enabled(true).rotation(-45).wordWrap('break-word');
    chart.palette(anychart.palettes.distinctColors);
    chart.background().fill('#f9f9fc');
    chart.container(chartRef.current);
    chart.draw();

    chartInstanceRef.current = chart;
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />
      <div className="carga-container">
        <div className="cabecalho-carga d-flex align-items-center flex-wrap gap-3 mb-4">
          <h2 className="titulo-principal flex-grow-1 mb-0">Carga Horária dos Equinos</h2>

          <div className="d-flex gap-2 justify-content-center flex-grow-1">
            {/* NOVO: botão para o gráfico anual */}
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/grafico-carga-horaria-equino-anual')}
            >
              Ver Carga Horária Anual
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
            <label className="form-label me-2 mb-0">Selecione o Mês:</label>
            <select
              className="form-select w-auto"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
            >
              <option value="">Selecione o mês...</option>
              {meses.map((mes) => {
                const [ano, num] = mes.split('-');
                return (
                  <option key={mes} value={mes}>
                    {mesesExtenso[num]} de {ano}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Legenda de cores */}
        <div className="legenda-carga mb-3">
          <span className="badge" style={{ backgroundColor: '#5cb85c' }}>31-60h</span>
          <span className="badge" style={{ backgroundColor: '#9370DB' }}>61-90h</span>
          <span className="badge" style={{ backgroundColor: '#ffa500' }}>91-120h</span>
          <span className="badge" style={{ backgroundColor: '#20c997' }}>121-150h</span>
          <span className="badge" style={{ backgroundColor: '#1e90ff' }}>151-180h</span>
          <span className="badge" style={{ backgroundColor: '#dc3545' }}>+180h</span>
        </div>

        <div ref={chartRef} className="chart-container" />
      </div>
    </div>
  );
};

export default GraficoCargaHorariaEquino;

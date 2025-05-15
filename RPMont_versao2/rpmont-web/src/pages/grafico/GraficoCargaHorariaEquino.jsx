import React, { useEffect, useRef, useState } from 'react';
import anychart from 'anychart';
import 'anychart/dist/css/anychart-ui.min.css';
import 'anychart/dist/fonts/css/anychart-font.min.css';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import './GraficoCargaHorariaEquino.css';

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

  useEffect(() => {
    const carregarDados = async () => {
      const [resEscala, resEquinos] = await Promise.all([
        axios.get('/escala'),
        axios.get('/equinos'),
      ]);

      const escalas = resEscala.data;
      const equinos = resEquinos.data;

      const mesesSet = new Set();
      escalas.forEach(esc => {
        const mes = esc.data.slice(0, 7);
        mesesSet.add(mes);
      });

      const mesesArray = Array.from(mesesSet).sort();
      setMeses(mesesArray);

      const mesPadrao = mesesArray[mesesArray.length - 1];
      setMesSelecionado(mesPadrao);

      montarGrafico(escalas, equinos, mesPadrao);
    };

    carregarDados();
  }, []);

  useEffect(() => {
    if (mesSelecionado) {
      Promise.all([axios.get('/escala'), axios.get('/equinos')])
        .then(([resEscala, resEquinos]) => {
          montarGrafico(resEscala.data, resEquinos.data, mesSelecionado);
        });
    }
  }, [mesSelecionado]);

  const montarGrafico = (escalas, equinos, mes) => {
    if (!chartRef.current) return;
    chartRef.current.innerHTML = '';

    const escalasFiltradas = escalas.filter(esc => esc.data.startsWith(mes));
    const equinoIds = [...new Set(escalasFiltradas.map(esc => esc.idEquino))];
    const equinosFiltrados = equinos.filter(eq => equinoIds.includes(eq.id));

    if (equinosFiltrados.length === 0) return;

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

      return {
        x: eq.name,
        value: total,
        fill: cor
      };
    });

    const chart = anychart.column();
    chart.animation(true);

    let ano = '', mesNum = '';
    if (mes && mes.includes('-')) [ano, mesNum] = mes.split('-');
    const nomeMes = mesesExtenso[mesNum] || mes;

    chart.title(`Carga Horária - ${nomeMes}`);
    const dataSet = anychart.data.set(dados);
    const mapping = dataSet.mapAs({ x: 'x', value: 'value', fill: 'fill' });
    chart.column(mapping);

    // Mostra os valores nos indicadores (barras)
    chart.labels().enabled(true);
    chart.labels().position('outside-top');
    chart.labels().anchor('center-bottom');    
    chart.labels().format('{%Value}h');

    chart.yScale().minimum(0).maximum(180).ticks({ interval: 30 });
    chart.tooltip().positionMode('point').format('Carga Horária: {%Value}h');
    chart.interactivity().hoverMode('by-x');
    chart.yAxis().title('Horas (limite: 180h/mês)');
    chart.xAxis().title('Equinos');
    chart.xAxis().labels()
      .enabled(true)
      .rotation(-45)
      .wordWrap('break-word');
    chart.palette(anychart.palettes.distinctColors);

    chart.background().fill('#f9f9fc');
    chart.container(chartRef.current);
    chart.draw();
    
    chartInstanceRef.current = chart;
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />
      <div className="inicial-container">
  
        {/* Cabeçalho com Título, Botões e Filtro de Mês */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
  
          {/* Título */}
          <div className="d-flex align-items-center flex-grow-1">
            <h2 className="titulo-principal ms-4 me-4">Carga Horária dos Equinos</h2>
          </div>
  
          {/* Botões de Ação */}
          <div className="d-flex gap-2 me-4">
            <button
              className="btn btn-primary btn-imprimir ms-4 me-4"
              onClick={() => chartInstanceRef.current?.print()}
            >
              Imprimir Gráfico
            </button>
  
            <button
              className="btn btn-outline-secondary me-4"
              onClick={() => {
                if (chartInstanceRef.current) {
                  chartInstanceRef.current.saveAsPdf();
                }
              }}
            >
              Gerar PDF
            </button>
          </div>
  
          {/* Filtro de Mês */}
          <div className="d-flex align-items-center filtro-mes ms-4">
            <label className="form-label me-2 mb-0">Selecione o Mês:</label>
            <select
              className="form-select w-auto"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
            >
              <option value="">Selecione o mês...</option>
              {meses.map(mes => {
                let ano = '', num = '';
                if (mes && mes.includes('-')) [ano, num] = mes.split('-');
                return (
                  <option key={mes} value={mes}>
                    {mesesExtenso[num]} de {ano}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
  
        {/* Gráfico */}
        <div ref={chartRef} className="chart-container" />
      </div>
    </div>
  );
  
  
};

export default GraficoCargaHorariaEquino;

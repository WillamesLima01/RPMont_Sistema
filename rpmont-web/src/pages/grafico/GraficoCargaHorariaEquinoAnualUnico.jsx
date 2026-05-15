// src/pages/veterinaria/GraficoCargaHorariaEquinoAnualUnico.jsx
import React, { useEffect, useRef, useState } from 'react';
import anychart from 'anychart';
import 'anychart/dist/css/anychart-ui.min.css';
import 'anychart/dist/fonts/css/anychart-font.min.css';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import { useLocation, useNavigate } from 'react-router-dom';
import './GraficoCargaHorariaEquino.css';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const GraficoCargaHorariaEquinoAnualUnico = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [equinos, setEquinos] = useState([]);
  const [equinoSelecionado, setEquinoSelecionado] = useState('');
  const [anosDisponiveis, setAnosDisponiveis] = useState([]);
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [serieMensal, setSerieMensal] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const obterDataEscala = (escala) => {
    return escala?.dataCadastro ?? escala?.data ?? null;
  };

  const obterEquinoIdEscala = (escala) => {
    return (
      escala?.equino?.id ??
      escala?.equinoId ??
      escala?.idEquino ??
      null
    );
  };

  const obterNomeEquino = (listaEquinos, idEquino) => {
    const equino = (listaEquinos || []).find(
      (item) => String(item.id) === String(idEquino)
    );

    return equino?.nome ?? equino?.name ?? `#${idEquino}`;
  };

  const montarGraficoLinha = (escalas, idEquino, ano, listaEquinos) => {
    if (!chartRef.current) return;

    chartRef.current.innerHTML = '';

    const somaPorMes = {};

    for (const { num, nome } of MESES) {
      somaPorMes[num] = {
        nomeMes: nome,
        horas: 0,
      };
    }

    (escalas || []).forEach((escala) => {
      const dataEscala = obterDataEscala(escala);

      if (!dataEscala) return;

      const dataTexto = String(dataEscala);

      if (!dataTexto.startsWith(ano)) return;

      const equinoIdEscala = obterEquinoIdEscala(escala);

      if (String(equinoIdEscala) !== String(idEquino)) return;

      const mes = dataTexto.slice(5, 7);
      const horas = Number(escala.cargaHoraria || 0) || 0;

      if (somaPorMes[mes]) {
        somaPorMes[mes].horas += horas;
      }
    });

    const pontos = MESES.map(({ num, nome }) => ({
      x: nome,
      value: somaPorMes[num].horas,
      monthNum: num,
    }));

    setSerieMensal(
      pontos.map((ponto) => ({
        mes: ponto.x,
        horas: ponto.value,
      }))
    );

    const totalAno = pontos.reduce(
      (acc, ponto) => acc + ponto.value,
      0
    );

    const nomeEquino = obterNomeEquino(listaEquinos, idEquino);

    if (totalAno === 0) {
      const div = document.createElement('div');
      div.className = 'p-3 text-center text-muted';
      div.innerText = `Não há registros de carga horária para ${nomeEquino} em ${ano}.`;

      chartRef.current.appendChild(div);
      chartInstanceRef.current = null;
      return;
    }

    const chart = anychart.line();
    chart.animation(true);
    chart.title(`Carga Horária — ${nomeEquino} (${ano})`);
    chart.background().fill('#f9f9fc');

    const dataSet = anychart.data.set(pontos);
    const series = chart.line(
      dataSet.mapAs({
        x: 'x',
        value: 'value',
      })
    );

    series.markers(true).size(4);

    chart.yScale().minimum(0);
    chart.yAxis().title('Horas por mês');
    chart.xAxis().title('Meses');

    chart.labels()
      .enabled(true)
      .position('center-top')
      .anchor('center-bottom')
      .format('{%Value}h');

    chart.tooltip()
      .positionMode('point')
      .titleFormat('{%x}')
      .format('Horas: {%Value}h');

    chart.container(chartRef.current);
    chart.draw();

    chartInstanceRef.current = chart;
  };

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const [resEscala, resEquinos] = await Promise.all([
          axios.get('/escala'),
          axios.get('/equino'),
        ]);

        const listaEscalas = Array.isArray(resEscala.data)
          ? resEscala.data
          : [];

        const listaEquinos = Array.isArray(resEquinos.data)
          ? resEquinos.data
          : [];

        setEquinos(listaEquinos);

        const anos = Array.from(
          new Set(
            listaEscalas
              .map((escala) => {
                const dataEscala = obterDataEscala(escala);
                return dataEscala ? String(dataEscala).slice(0, 4) : '';
              })
              .filter(Boolean)
          )
        ).sort();

        setAnosDisponiveis(anos);

        const stateAno = location.state?.ano;
        const stateEquinoId = location.state?.equinoId;

        const anoPadrao =
          stateAno ||
          anos[anos.length - 1] ||
          String(new Date().getFullYear());

        const idPadrao =
          stateEquinoId ||
          (listaEquinos[0]?.id ?? '');

        setAnoSelecionado(anoPadrao);
        setEquinoSelecionado(idPadrao);

        if (idPadrao && anoPadrao) {
          montarGraficoLinha(
            listaEscalas,
            idPadrao,
            anoPadrao,
            listaEquinos
          );
        }
      } catch (error) {
        console.error('Erro ao carregar gráfico anual do equino:', error);

        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div class="p-3 text-center text-danger">Erro ao carregar os dados do gráfico.</div>';
        }
      }
    };

    carregarDadosIniciais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!equinoSelecionado || !anoSelecionado) return;

    const atualizarGrafico = async () => {
      try {
        const [resEscala, resEquinos] = await Promise.all([
          axios.get('/escala'),
          axios.get('/equino'),
        ]);

        const listaEscalas = Array.isArray(resEscala.data)
          ? resEscala.data
          : [];

        const listaEquinos = Array.isArray(resEquinos.data)
          ? resEquinos.data
          : [];

        setEquinos(listaEquinos);

        montarGraficoLinha(
          listaEscalas,
          equinoSelecionado,
          anoSelecionado,
          listaEquinos
        );
      } catch (error) {
        console.error('Erro ao atualizar gráfico anual do equino:', error);

        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div class="p-3 text-center text-danger">Erro ao atualizar os dados do gráfico.</div>';
        }
      }
    };

    atualizarGrafico();
  }, [equinoSelecionado, anoSelecionado]);

  const gerarPdfDetalhado = () => {
    if (!anoSelecionado || !equinoSelecionado) return;

    const nomeEquino = obterNomeEquino(equinos, equinoSelecionado);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const margem = 40;

    doc.setFontSize(16);
    doc.text(
      `Carga Horária — ${nomeEquino} (${anoSelecionado})`,
      margem,
      36
    );

    const head = [['Mês', 'Horas (h)']];

    const body = serieMensal.map((linha) => [
      linha.mes,
      String(linha.horas),
    ]);

    const total = serieMensal.reduce(
      (acc, linha) => acc + Number(linha.horas || 0),
      0
    );

    autoTable(doc, {
      head,
      body,
      startY: 56,
      styles: {
        fontSize: 10,
        cellPadding: 6,
      },
      headStyles: {
        fillColor: [33, 150, 243],
      },
      margin: {
        left: margem,
        right: margem,
      },
      columnStyles: {
        1: {
          halign: 'right',
          cellWidth: 120,
        },
      },
    });

    doc.setFontSize(12);
    doc.text(
      `Total no ano: ${total}h`,
      margem,
      doc.lastAutoTable.finalY + 18
    );

    doc.save(`carga-horaria-${nomeEquino}-${anoSelecionado}.pdf`);
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <div className="carga-container">
        <div className="cabecalho-carga d-flex align-items-center flex-wrap gap-3 mb-4">
          <h2 className="titulo-principal flex-grow-1 mb-0">
            Carga Horária – Equino Específico (Anual)
          </h2>

          <div className="d-flex gap-2 justify-content-center flex-grow-1">
            <button
              className="btn btn-secondary"
              onClick={() =>
                navigate('/grafico-carga-horaria-equino-anual')
              }
            >
              Voltar ao Anual
            </button>

            <button
              className="btn btn-primary"
              onClick={() => chartInstanceRef.current?.print()}
            >
              Imprimir Gráfico
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={() => chartInstanceRef.current?.saveAsPdf()}
            >
              Gerar PDF (gráfico)
            </button>

            <button
              className="btn btn-outline-danger"
              onClick={gerarPdfDetalhado}
            >
              PDF Detalhado (tabela)
            </button>

            <button
              className="btn btn-outline-success"
              onClick={() => chartInstanceRef.current?.saveAsPng()}
            >
              Salvar PNG
            </button>
          </div>

          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0">Ano:</label>

            <select
              className="form-select w-auto"
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
            >
              <option value="">Selecione o ano...</option>

              {anosDisponiveis.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>

            <label className="form-label mb-0 ms-3">Equino:</label>

            <select
              className="form-select w-auto"
              value={equinoSelecionado}
              onChange={(e) => setEquinoSelecionado(e.target.value)}
            >
              <option value="">Selecione o equino...</option>

              {equinos.map((equino) => (
                <option key={equino.id} value={equino.id}>
                  {equino.nome ?? equino.name ?? `#${equino.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div ref={chartRef} className="chart-container" />
      </div>
    </div>
  );
};

export default GraficoCargaHorariaEquinoAnualUnico;
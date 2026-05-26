import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './Grafico.module.css';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';

// ---- Toast (MUI) ----
import { Snackbar, Alert, AlertTitle, Button, Stack } from '@mui/material';

// ---- Datas ----
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Grafico = () => {
  const [labelsMeses, setLabelsMeses] = useState([]);
  const [dadosAtendimentos, setDadosAtendimentos] = useState([]);
  const [dadosBaixados, setDadosBaixados] = useState([]);
  const [qtdEquinos, setQtdEquinos] = useState(0);
  const [qtdAptos, setQtdAptos] = useState(0);
  const [qtdBaixados, setQtdBaixados] = useState(0);
  const [qtdAtendimentos, setQtdAtendimentos] = useState(0);

  // ---- Alertas ----
  const [alertas, setAlertas] = useState([]);
  const [toastAberto, setToastAberto] = useState(false);

  const maxAtendimentos = Math.max(...dadosAtendimentos, 10);

  const normalizaData = (d) => (d ? dayjs(d) : null);

  const obterIdEquinoBaixado = (baixa) => {
    return (
      baixa.equinoId ??
      baixa.equino_id ??
      baixa.idEquino ??
      baixa.id_equino ??
      baixa.idEq ??
      baixa.id_Eq ??
      baixa.equino?.id ??
      baixa.equino?.idEquino ??
      null
    );
  };

  const obterDataBaixa = (baixa) => {
    return (
      baixa.dataBaixa ??
      baixa.data_baixa ??
      baixa.dataBaixado ??
      baixa.data_baixado ??
      baixa.data ??
      null
    );
  };

  const obterDataRetorno = (baixa) => {
    return (
      baixa.dataRetorno ??
      baixa.data_retorno ??
      baixa.dataRetornoBaixa ??
      baixa.data_retorno_baixa ??
      null
    );
  };

  /*
    Converte a data para chave ANO-MÊS no formato yyyy-mm.

    Exemplos:
    2026-05-10       -> 2026-05
    2026-05-10T00... -> 2026-05
    10-05-2026       -> 2026-05
    10/05/2026       -> 2026-05

    Isso garante que cada linha da tabela equino_baixado
    seja contada no mês correto pela coluna data_baixa.
  */
  const obterChaveMesAno = (data) => {
    if (!data) return null;

    const texto = String(data).trim();

    // yyyy-mm-dd ou yyyy-mm-ddTHH:mm:ss
    if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
      return texto.slice(0, 7);
    }

    // dd-mm-yyyy
    if (/^\d{2}-\d{2}-\d{4}$/.test(texto)) {
      const [, mes, ano] = texto.split('-');
      return `${ano}-${mes}`;
    }

    // dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
      const [, mes, ano] = texto.split('/');
      return `${ano}-${mes}`;
    }

    return null;
  };

  useEffect(() => {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
  
    const hoje = new Date();
  
    const dataMesMenos2 = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
    const dataMesMenos1 = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const dataMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
    const datasGrafico = [dataMesMenos2, dataMesMenos1, dataMesAtual];
  
    const labels = datasGrafico.map(
      (data) => `${meses[data.getMonth()]} / ${data.getFullYear()}`
    );
  
    const chavesMeses = datasGrafico.map(
      (data) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
    );
  
    setLabelsMeses(labels);
  
    Promise.all([
      axios.get('/equino'),
      axios.get('/atendimentos'),
  
      // Card: baixados ativos
      axios.get('/equino/baixados'),
  
      // Gráfico: histórico completo da tabela equino_baixado
      axios.get('/equino/historico'),
    ])
      .then(([resEquinos, resAtendimentos, resBaixadosAtivos, resHistoricoBaixados]) => {
        const equinos = Array.isArray(resEquinos.data) ? resEquinos.data : [];
  
        const atendimentos = Array.isArray(resAtendimentos.data)
          ? resAtendimentos.data
          : [];
  
        const baixadosAtivos = Array.isArray(resBaixadosAtivos.data)
          ? resBaixadosAtivos.data
          : [];
  
        const historicoBaixados = Array.isArray(resHistoricoBaixados.data)
          ? resHistoricoBaixados.data
          : [];
  
        setQtdEquinos(equinos.length);
        setQtdAtendimentos(atendimentos.length);
  
        /*
          CARD DE BAIXADOS:
          usa /equino/baixados, pois aqui queremos somente os baixados atualmente.
        */
        const idsBaixadosAtivos = new Set(
          baixadosAtivos
            .filter((baixa) => {
              const dataRetorno = obterDataRetorno(baixa);
              return !dataRetorno || String(dataRetorno).trim() === '';
            })
            .map((baixa) => obterIdEquinoBaixado(baixa))
            .filter((id) => id !== null && id !== undefined && id !== '')
            .map((id) => String(id))
        );
  
        setQtdBaixados(idsBaixadosAtivos.size);
        setQtdAptos(Math.max(0, equinos.length - idsBaixadosAtivos.size));
  
        const mapAtendimentos = {};
        const mapBaixados = {};
  
        chavesMeses.forEach((key) => {
          mapAtendimentos[key] = 0;
          mapBaixados[key] = 0;
        });
  
        /*
          GRÁFICO DE ATENDIMENTOS
        */
        atendimentos.forEach((atendimento) => {
          const dataAtendimento =
            atendimento.dataAtendimento ??
            atendimento.data_atendimento ??
            atendimento.data ??
            null;
  
          if (!dataAtendimento) return;
  
          const mesAno = String(dataAtendimento).slice(0, 7);
  
          if (mapAtendimentos[mesAno] !== undefined) {
            mapAtendimentos[mesAno]++;
          }
        });
  
        /*
          GRÁFICO DE EQUINOS BAIXADOS:
          usa /equino/historico.
          Cada registro do histórico conta como 1 baixa no mês da dataBaixa.
        */
        historicoBaixados.forEach((baixa) => {
          const dataBaixa = obterDataBaixa(baixa);
  
          if (!dataBaixa) return;
  
          const mesAno = String(dataBaixa).slice(0, 7);
  
          if (mapBaixados[mesAno] !== undefined) {
            mapBaixados[mesAno]++;
          }
        });
  
        setDadosAtendimentos(chavesMeses.map((key) => mapAtendimentos[key]));
        setDadosBaixados(chavesMeses.map((key) => mapBaixados[key]));
  
        console.log('Baixados ativos:', baixadosAtivos);
        console.log('Histórico baixados:', historicoBaixados);
        console.log('Mapa baixados:', mapBaixados);
      })
      .catch((error) => {
        console.error('Erro ao carregar dados do gráfico:', error);
      });
  }, []);

  useEffect(() => {
    const proximaPorEquino = (
      lista,
      getId,
      campo = 'dataProximoProcedimento',
      fallbackCampo = 'data'
    ) => {
      const mapa = new Map();
      const hoje = dayjs().startOf('day');

      for (const item of lista || []) {
        const id = String(getId(item));

        if (!id || id === 'undefined' || id === 'null') continue;

        let d = normalizaData(item[campo]);

        if (!d?.isValid()) {
          const df = normalizaData(item[fallbackCampo]);
          if (df?.isValid()) d = df;
        }

        if (!d?.isValid()) continue;

        const d0 = d.startOf('day');

        if (d0.isBefore(hoje)) continue;

        const atualIso = mapa.get(id);

        if (!atualIso) {
          mapa.set(id, d0.toISOString());
        } else {
          const atual = dayjs(atualIso);
          if (d0.isBefore(atual)) mapa.set(id, d0.toISOString());
        }
      }

      return mapa;
    };

    (async () => {
      try {
        const [respEquinos, respVac, respVer] = await Promise.all([
          axios.get('/equino'),
          axios.get('/vacinacao'),
          axios.get('/vermifugacao'),
        ]);

        const equinos = Array.isArray(respEquinos.data) ? respEquinos.data : [];
        const vacinacoes = Array.isArray(respVac.data) ? respVac.data : [];
        const vermifugacoes = Array.isArray(respVer.data) ? respVer.data : [];

        const proxVac = proximaPorEquino(
          vacinacoes,
          (r) => String(r.id_Eq ?? r.equinoId ?? r.idEquino ?? r.id_equino),
          'dataProximoProcedimento',
          'data'
        );

        const proxVer = proximaPorEquino(
          vermifugacoes,
          (r) => String(r.equinoId ?? r.idEquino ?? r.id_Eq ?? r.id_equino),
          'dataProximoProcedimento',
          'data'
        );

        const hoje = dayjs().startOf('day');
        const limite = hoje.add(15, 'day');

        const mapaEquinos = new Map(
          equinos.map((e) => [String(e.id ?? e.idEquino ?? e.id_equino), e])
        );

        const lista = [];

        const pushIfDentro15 = (tipo, eqId, iso) => {
          if (!iso) return;

          const d = dayjs(iso).startOf('day');

          if (d.isBefore(hoje) || d.isAfter(limite)) return;

          const eq = mapaEquinos.get(eqId) || {};

          lista.push({
            tipo,
            equinoId: eqId,
            nome: eq.nome || `#${eqId}`,
            dataProxima: d.format('DD/MM/YYYY'),
            diasParaVencer: d.diff(hoje, 'day'),
          });
        };

        for (const [eqId, iso] of proxVac.entries()) {
          pushIfDentro15('Vacinação', eqId, iso);
        }

        for (const [eqId, iso] of proxVer.entries()) {
          pushIfDentro15('Vermifugação', eqId, iso);
        }

        lista.sort((a, b) => a.diasParaVencer - b.diasParaVencer);

        if (lista.length) {
          setAlertas(lista);
          setToastAberto(true);
        }
      } catch (error) {
        console.error('Erro ao carregar alertas:', error);
      }
    })();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 200,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.ceil((maxAtendimentos + 5) / 5) * 5,
        ticks: {
          stepSize: 5,
          font: {
            size: 11,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const atendimentosData = {
    labels: labelsMeses,
    datasets: [
      {
        label: 'Quantidade de Atendimentos',
        data: dadosAtendimentos,
        backgroundColor: '#43e97b',
        borderRadius: 10,
      },
    ],
  };

  const baixadosData = {
    labels: labelsMeses,
    datasets: [
      {
        label: 'Equinos Baixados',
        data: dadosBaixados,
        backgroundColor: '#f5576c',
        borderRadius: 10,
      },
    ],
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <div className={styles['inicial-container']}>
        <Link
          to="/equino-list?filtro=todos"
          className={`${styles['stat-box']} ${styles['stat-box-blue']}`}
        >
          <h3>Equinos</h3>
          <p>{qtdEquinos}</p>
        </Link>

        <Link
          to="/equino-list"
          className={`${styles['stat-box']} ${styles['stat-box-green']}`}
        >
          <h3>Equinos Aptos</h3>
          <p>{qtdAptos}</p>
        </Link>

        <Link
          to="/veterinaria-equinos-baixados"
          className={`${styles['stat-box']} ${styles['stat-box-orange']}`}
        >
          <h3>Equinos Baixados</h3>
          <p>{qtdBaixados}</p>
        </Link>

        <Link
          to="/atendimento-list"
          className={`${styles['stat-box']} ${styles['stat-box-green']}`}
        >
          <h3>Atendimentos</h3>
          <p>{qtdAtendimentos}</p>
        </Link>

        <div className={styles['charts-container']}>
          <div className={styles.chart}>
            <h3>Atendimentos (2 meses anteriores + mês atual)</h3>

            <div className={styles.chartCanvasWrap}>
              <Bar data={atendimentosData} options={options} />
            </div>
          </div>

          <div className={styles.chart}>
            <h3>Registros de Baixas por Mês (2 meses anteriores + mês atual)</h3>

            <div className={styles.chartCanvasWrap}>
              <Bar data={baixadosData} options={options} />
            </div>
          </div>
        </div>
      </div>

      {!!alertas.length && (
        <Snackbar
          open={toastAberto}
          onClose={() => setToastAberto(false)}
          autoHideDuration={10000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setToastAberto(false)}
            severity="warning"
            variant="filled"
            sx={{ minWidth: 360, maxWidth: 480 }}
          >
            <AlertTitle>
              Atenção: {alertas.length}{' '}
              {alertas.length === 1 ? 'procedimento' : 'procedimentos'} vencem em até
              15 dias
            </AlertTitle>

            <Stack gap={0.5}>
              {alertas.slice(0, 6).map((a, i) => (
                <div key={i}>
                  {a.tipo} • {a.nome} — próximo: {a.dataProxima} ({a.diasParaVencer}{' '}
                  dias)
                </div>
              ))}

              {alertas.length > 6 && <div>… e mais {alertas.length - 6}</div>}

              <Stack direction="row" gap={1} sx={{ mt: 1 }}>
                <Button
                  component={Link}
                  to="/vacinacao-list"
                  size="small"
                  variant="outlined"
                  color="inherit"
                >
                  Vacinações
                </Button>

                <Button
                  component={Link}
                  to="/vermifugacao-list"
                  size="small"
                  variant="outlined"
                  color="inherit"
                >
                  Vermifugações
                </Button>
              </Stack>
            </Stack>
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export default Grafico;
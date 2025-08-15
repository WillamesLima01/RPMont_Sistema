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

  const maxAtendimentos = Math.max(...dadosAtendimentos, 10); // mínimo de segurança

  const normalizaData = (d) => (d ? dayjs(d) : null);

  // Pega o último registro por equino (maior data)
  const ultimoRegistroPorEquino = (registros, obterIdFn, campoData = 'data') => {
    const mapa = new Map();
    for (const r of registros || []) {
      const id = obterIdFn(r);
      const dt = normalizaData(r[campoData]);
      if (!id || !dt?.isValid()) continue;
      const atual = mapa.get(id);
      if (!atual || dt.isAfter(atual.data)) {
        mapa.set(id, { ...r, data: dt });
      }
    }
    return mapa;
  };

  // ====== Estatísticas / gráficos ======
  useEffect(() => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const hoje = new Date();
    const ultimosMeses = [];
    const chavesMeses = [];

    for (let i = 2; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      ultimosMeses.push(meses[data.getMonth()]);
      chavesMeses.push(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`);
    }

    setLabelsMeses(ultimosMeses);

    Promise.all([axios.get('/equinos'), axios.get('/atendimentos')])
      .then(([resEquinos, resAtendimentos]) => {
        const equinos = resEquinos.data || [];
        const atendimentos = resAtendimentos.data || [];

        setQtdEquinos(equinos.length);
        setQtdAptos(equinos.filter(e => e.status === 'Ativo').length);
        setQtdBaixados(equinos.filter(e => e.status === 'Baixado').length);
        setQtdAtendimentos(atendimentos.length);

        const mapAtendimentos = {};
        const mapBaixados = {};

        chavesMeses.forEach(key => {
          mapAtendimentos[key] = 0;
          mapBaixados[key] = 0;
        });

        atendimentos.forEach(at => {
          const mesAno = (at.data || '').slice(0, 7);
          if (mapAtendimentos[mesAno] !== undefined) {
            mapAtendimentos[mesAno]++;
            const equino = equinos.find(eq => eq.id === at.idEquino);
            if (equino && equino.status === 'Baixado') {
              mapBaixados[mesAno]++;
            }
          }
        });

        setDadosAtendimentos(chavesMeses.map(key => mapAtendimentos[key]));
        setDadosBaixados(chavesMeses.map(key => mapBaixados[key]));
      });
  }, []);

  // ====== Checar próximos vencimentos (usa data/proximaData como PRÓXIMO agendado) ======
  useEffect(() => {
    (async () => {
      try {
        const [respEquinos, respVac, respVer] = await Promise.all([
          axios.get('/equinos'),
          axios.get('/vacinacoes'),
          axios.get('/vermifugacoes')
        ]);

        const equinos = respEquinos.data || [];
        const vacinacoes = respVac.data || [];
        const vermifugacoes = respVer.data || [];

        const ultVac = ultimoRegistroPorEquino(
          vacinacoes,
          (r) => String(r.id_Eq ?? r.equinoId ?? r.idEquino ?? r.id_equino),
          'data'
        );
        const ultVer = ultimoRegistroPorEquino(
          vermifugacoes,
          (r) => String(r.equinoId ?? r.idEquino ?? r.id_Eq ?? r.id_equino),
          'data'
        );

        const hoje = dayjs().startOf('day');
        const limite = hoje.add(15, 'day'); // janela de 15 dias
        const mapaEquinos = new Map(equinos.map(e => [String(e.id ?? e.idEquino ?? e.id_equino), e]));
        const lista = [];

        const proximaDataDoRegistro = (registro) => {
          // usa proximaData se existir; caso contrário, usa data do registro como data-alvo
          const d = normalizaData(registro?.proximaData || registro?.data);
          return d?.isValid() ? d.startOf('day') : null;
        };

        // Vacinação
        for (const [eqId, reg] of ultVac.entries()) {
          const prox = proximaDataDoRegistro(reg);
          if (!prox) continue;
          // hoje ou próximos 15 dias (sem incluir vencidos)
          if (prox.isSame(hoje, 'day') || (prox.isAfter(hoje) && prox.isSameOrBefore(limite))) {
            const eq = mapaEquinos.get(eqId) || {};
            lista.push({
              tipo: 'Vacinação',
              equinoId: eqId,
              nome: eq.name || eq.nome || `#${eqId}`,
              dataUltimo: '-', // opcional: não usamos cálculo de última, só próxima
              dataProxima: prox.format('DD/MM/YYYY'),
              diasParaVencer: prox.diff(hoje, 'day')
            });
          }
        }

        // Vermifugação
        for (const [eqId, reg] of ultVer.entries()) {
          const prox = proximaDataDoRegistro(reg);
          if (!prox) continue;
          if (prox.isSame(hoje, 'day') || (prox.isAfter(hoje) && prox.isSameOrBefore(limite))) {
            const eq = mapaEquinos.get(eqId) || {};
            lista.push({
              tipo: 'Vermifugação',
              equinoId: eqId,
              nome: eq.name || eq.nome || `#${eqId}`,
              dataUltimo: '-',
              dataProxima: prox.format('DD/MM/YYYY'),
              diasParaVencer: prox.diff(hoje, 'day')
            });
          }
        }

        lista.sort((a, b) => a.diasParaVencer - b.diasParaVencer);

        if (lista.length) {
          setAlertas(lista);
          setToastAberto(true);
        }
      } catch {
        // silencioso
      }
    })();
  }, []);

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.ceil((maxAtendimentos + 5) / 5) * 5,
        ticks: { stepSize: 5 },
      },
    },
  };

  const atendimentosData = {
    labels: labelsMeses,
    datasets: [
      { label: 'Quantidade de Atendimentos', data: dadosAtendimentos, backgroundColor: '#43e97b', borderRadius: 10 },
    ],
  };

  const baixadosData = {
    labels: labelsMeses,
    datasets: [
      { label: 'Equinos Baixados', data: dadosBaixados, backgroundColor: '#f5576c', borderRadius: 10 },
    ],
  };

  return (
    <div className="container-fluid mt-page">
      <Navbar />
      <div className={styles['inicial-container']}>
        <Link to="/veterinaria-List" className={`${styles['stat-box']} ${styles['stat-box-blue']}`}>
          <h3>Equinos</h3>
          <p>{qtdEquinos}</p>
        </Link>
        <Link to="/veterinaria-List" className={`${styles['stat-box']} ${styles['stat-box-green']}`}>
          <h3>Equinos Aptos</h3>
          <p>{qtdAptos}</p>
        </Link>
        <Link to="/veterinaria-Equinos-Baixados" className={`${styles['stat-box']} ${styles['stat-box-orange']}`}>
          <h3>Equinos Baixados</h3>
          <p>{qtdBaixados}</p>
        </Link>
        <Link to="/atendimento-List" className={`${styles['stat-box']} ${styles['stat-box-green']}`}>
          <h3>Atendimentos</h3>
          <p>{qtdAtendimentos}</p>
        </Link>

        <div className={styles['charts-container']}>
          <div className={styles.chart}>
            <h3>Atendimentos (Últimos 3 meses)</h3>
            <Bar data={atendimentosData} options={options} />
          </div>
          <div className={styles.chart}>
            <h3>Equinos Baixados (Últimos 3 meses)</h3>
            <Bar data={baixadosData} options={options} />
          </div>
        </div>
      </div>

      {/* Toast de alertas no canto inferior direito */}
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
              Atenção: {alertas.length} {alertas.length === 1 ? 'procedimento' : 'procedimentos'} vencem em até 15 dias
            </AlertTitle>

            <Stack gap={0.5}>
              {alertas.slice(0, 6).map((a, i) => (
                <div key={i}>
                  {a.tipo} • {a.nome} — próximo: {a.dataProxima} ({a.diasParaVencer} dias)
                </div>
              ))}
              {alertas.length > 6 && <div>… e mais {alertas.length - 6}</div>}

              <Stack direction="row" gap={1} sx={{ mt: 1 }}>
                <Button component={Link} to="/veterinaria-vacinacao-list" size="small" variant="outlined" color="inherit">
                  Vacinações
                </Button>
                <Button component={Link} to="/veterinaria-vermifugacao-list" size="small" variant="outlined" color="inherit">
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
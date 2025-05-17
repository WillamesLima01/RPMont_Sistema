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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Grafico = () => {
  const [labelsMeses, setLabelsMeses] = useState([]);
  const [dadosAtendimentos, setDadosAtendimentos] = useState([]);
  const [dadosBaixados, setDadosBaixados] = useState([]);
  const [qtdEquinos, setQtdEquinos] = useState(0);
  const [qtdAptos, setQtdAptos] = useState(0);
  const [qtdBaixados, setQtdBaixados] = useState(0);
  const [qtdAtendimentos, setQtdAtendimentos] = useState(0);
  const maxAtendimentos = Math.max(...dadosAtendimentos, 10); // valor de segurança mínimo

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
        const equinos = resEquinos.data;
        const atendimentos = resAtendimentos.data;

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
          const mesAno = at.data.slice(0, 7);
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
  
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.ceil((maxAtendimentos + 5) / 5) * 5, // arredonda para múltiplos de 5
        ticks: {
          stepSize: 5,
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
        <Link to="/veterinariaList" className={`${styles['stat-box']} ${styles['stat-box-blue']}`}>
          <h3>Equinos</h3>
          <p>{qtdEquinos}</p>
        </Link>
        <Link to="/veterinariaList" className={`${styles['stat-box']} ${styles['stat-box-green']}`}>
          <h3>Equinos Aptos</h3>
          <p>{qtdAptos}</p>
        </Link>
        <Link to="/veterinaria-Equinos-Baixados" className={`${styles['stat-box']} ${styles['stat-box-orange']}`}>
          <h3>Equinos Baixados</h3>
          <p>{qtdBaixados}</p>
        </Link>
        <Link to="/atendimentoList" className={`${styles['stat-box']} ${styles['stat-box-green']}`}>
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
    </div>
  );
};

export default Grafico;

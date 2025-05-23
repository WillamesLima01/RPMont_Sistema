import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/navbar/Navbar';
import axios from '../../api';
import 'jspdf-autotable';
import html2pdf from 'html2pdf.js';

import './Veterinaria.css';
import { useNavigate } from 'react-router-dom';

const VeterinariaRelatorioEquino = () => {
  const [equinos, setEquinos] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [escalas, setEscalas] = useState([]);
  const [baixas, setBaixas] = useState([]);

  const [filtroEquino, setFiltroEquino] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [tipoRelatorio, setTipoRelatorio] = useState('completo');

  const [resultado, setResultado] = useState(null);
  const divRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/equinos').then(res => setEquinos(res.data));
    axios.get('/atendimentos').then(res => setAtendimentos(res.data));
    axios.get('/escala').then(res => setEscalas(res.data));
    axios.get('/equinosBaixados').then(res => setBaixas(res.data));
  }, []);

  const gerarRelatorio = () => {
  const inicioDate = filtroInicio ? new Date(filtroInicio) : new Date('0000-01-01');
  const fimDate = filtroFim ? new Date(filtroFim) : new Date('9999-12-31');

  const equinosSelecionados = filtroEquino
    ? equinos.filter(e => e.id === filtroEquino)
    : equinos;

  const dados = equinosSelecionados.map(eq => {
    const atend = atendimentos.filter(a => {
      const dataAt = new Date(a.data);
      return a.idEquino === eq.id && dataAt >= inicioDate && dataAt <= fimDate;
    });

    const esc = escalas.filter(s => {
      const dataEsc = new Date(s.data);
      return s.idEquino === eq.id && dataEsc >= inicioDate && dataEsc <= fimDate;
    });

    const baixasEq = baixas.filter(b => b.idEquino === eq.id);

    let baixasFiltradas = [];
    let totalDiasBaixado = 0;

    baixasEq.forEach(b => {
      const dataBaixa = new Date(b.dataBaixa);
      const dataRetorno = b.dataRetorno ? new Date(b.dataRetorno) : new Date();

      if (dataBaixa >= inicioDate && dataBaixa <= fimDate) {
        const dias = Math.ceil((dataRetorno - dataBaixa) / (1000 * 60 * 60 * 24));
        totalDiasBaixado += dias;
        baixasFiltradas.push({
          dataBaixa: dataBaixa.toLocaleDateString('pt-BR'),
          dataRetorno: b.dataRetorno ? dataRetorno.toLocaleDateString('pt-BR') : '—',
          dias
        });
      }
    });

    const cargaTotal = esc.reduce((acc, esc) => acc + (Number(esc.cargaHoraria) || 0), 0);

    return {
      equino: eq.name,
      atendimentos: tipoRelatorio !== 'baixas' && tipoRelatorio !== 'escalas' ? atend : [],
      escalas: tipoRelatorio !== 'atendimentos' && tipoRelatorio !== 'baixas' ? esc : [],
      baixas: tipoRelatorio !== 'atendimentos' && tipoRelatorio !== 'escalas' ? baixasFiltradas : [],
      cargaTotal,
      totalAtendimentos: atend.length,
      totalBaixas: baixasFiltradas.length,
      totalDiasBaixado,
      totalEscalas: esc.length
    };
  });

  setResultado(dados);
};


  const imprimir = () => {
    window.print();
  };

  const gerarPDF = () => {
    if (divRef.current) {
        const clone = divRef.current.cloneNode(true);

        // Criação do cabeçalho
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
        ? (equinos.find(eq => eq.id === filtroEquino)?.name || 'Desconhecido')
        : 'Todos';
        const tipoTexto = tipoRelatorio.charAt(0).toUpperCase() + tipoRelatorio.slice(1);

        filtros.innerText = `${periodoTexto} | Equino: ${equinoNome} | Tipo: ${tipoTexto}`;
        cabecalho.appendChild(filtros);

        clone.prepend(cabecalho);

        const opt = {
        margin: 0.5,
        filename: 'relatorio_equinos.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(clone).save();
    }
    };


  return (
    <div className='container-fluid mt-page'>
      <Navbar />
      <div className='relatorio-card shadow p-4 rounded-4 bg-white'>
        <h2 className='mb-4 text-primary'>Relatório de Equinos</h2>

        <div className='row mb-3'>
          <div className='col-md-3'>
            <label className='form-label fw-bold'>Período Inicial:</label>
            <input type='date' className='form-control' value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)} />
          </div>
          <div className='col-md-3'>
            <label className='form-label fw-bold'>Período Final:</label>
            <input type='date' className='form-control' value={filtroFim} onChange={e => setFiltroFim(e.target.value)} />
          </div>
          <div className='col-md-3'>
            <label className='form-label fw-bold'>Equino:</label>
            <select className='form-select' value={filtroEquino} onChange={e => setFiltroEquino(e.target.value)}>
              <option value=''>Todos</option>
              {equinos.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </select>
          </div>
          <div className='col-md-3'>
            <label className='form-label fw-bold'>Tipo de Relatório:</label>
            <select className='form-select' value={tipoRelatorio} onChange={e => setTipoRelatorio(e.target.value)}>
              <option value='completo'>Completo</option>
              <option value='atendimentos'>Somente Atendimentos</option>
              <option value='baixas'>Somente Baixas</option>
              <option value='escalas'>Somente Escalas</option>
            </select>
          </div>
        </div>

        <div className='d-flex justify-content-end gap-2 mb-3'>
          <button className='btn btn-outline-danger' onClick={() => navigate(-1)}>Voltar</button>
          <button className='btn btn-success' onClick={gerarRelatorio}>Gerar Relatório</button>
          <button className='btn btn-outline-primary d-print-none' onClick={imprimir}>Imprimir</button>
          <button className='btn btn-outline-secondary d-print-none' onClick={gerarPDF}>Gerar PDF</button>
        </div>

        {resultado && resultado.length > 0 && (
          <div ref={divRef} className='relatorio-result mt-4'>
            {resultado.map((r, index) => (
              <div key={index} className='relatorio-bloco mb-5 p-4 border rounded shadow-sm'>
                <h4 className='mb-3'>{r.equino}</h4>
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
                    <h5 className='mt-3'>Atendimentos</h5>
                    <ul>
                      {r.atendimentos.map((a, i) => (
                        <li key={i}>{new Date(a.data).toLocaleDateString('pt-BR')} - {a.textoConsulta}</li>
                      ))}
                    </ul>
                  </>
                )}

                {r.baixas.length > 0 && (
                  <>
                    <h5 className='mt-3'>Baixas</h5>
                    <ul>
                      {r.baixas.map((b, i) => (
                        <li key={i}>Baixado em {b.dataBaixa}, retornou em {b.dataRetorno} ({b.dias} dias)</li>
                      ))}
                    </ul>
                  </>
                )}

                {r.escalas.length > 0 && (
                  <>
                    <h5 className='mt-3'>Escalas</h5>
                    <ul>
                      {r.escalas.map((s, i) => (
                        <li key={i}>{new Date(s.data).toLocaleDateString('pt-BR')} - {s.localTrabalho}, {s.jornadaTrabalho}, Cavaleiro: {s.cavaleiro}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VeterinariaRelatorioEquino;

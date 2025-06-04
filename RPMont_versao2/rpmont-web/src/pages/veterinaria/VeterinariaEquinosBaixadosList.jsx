import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import Modal from 'react-modal';

import jsPDF from 'jspdf';
import 'jspdf-autotable';


Modal.setAppElement('#root');

const VeterinariaEquinosBaixadosList = () => {
  const [equinos, setEquinos] = useState([]);
  const [equinosBaixados, setEquinosBaixados] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [resultado, setResultado] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    carregarEquinos();
  }, []);

  const carregarEquinos = async () => {
    const [resEquinos, resBaixados] = await Promise.all([
      axios.get('/equinos'),
      axios.get('/equinosBaixados'),
    ]);

    const baixadosAtivos = resEquinos.data.filter(eq => eq.status === 'Baixado');
    setEquinos(baixadosAtivos);
    setEquinosBaixados(resBaixados.data);

    // Define resultado inicial (todos os baixados ativos)
    const resultadoInicial = baixadosAtivos.filter(eq => {
      const registro = resBaixados.data.find(b => b.idEquino === eq.id && !b.dataRetorno);
      return !!registro;
    });

    setResultado(resultadoInicial);
  };

  const filtrar = () => {
    const filtrados = equinos.filter(eq => {
      const registro = equinosBaixados.find(b => b.idEquino === eq.id && !b.dataRetorno);
      if (!registro) return false;

      const nomeOK = !filtroNome || eq.id === filtroNome;
      const dataOK =
        (!filtroInicio || registro.dataBaixa >= filtroInicio) &&
        (!filtroFim || registro.dataBaixa <= filtroFim);

      return nomeOK && dataOK;
    });

    setResultado(filtrados);
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroInicio('');
    setFiltroFim('');
    filtrar(); // mostra tudo
  };

  const exportarCSV = () => {
    const linhas = ['Nome,Raça,Pelagem,Registro,Status'];
    resultado.forEach(eq => {
      linhas.push(`${eq.name},${eq.raca},${eq.pelagem},${eq.numeroRegistro},${eq.status}`);
    });

    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'equinos_baixados.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRetorno = async (equino) => {
    const registroBaixa = equinosBaixados.find(b => b.idEquino === equino.id && !b.dataRetorno);
    if (!registroBaixa) return alert('Registro de baixa não encontrado.');

    try {
      await axios.patch(`/equinos/${equino.id}`, { status: 'Ativo' });

      await axios.patch(`/equinosBaixados/${registroBaixa.id}`, {
        dataRetorno: new Date().toISOString().slice(0, 10),
      });

      setModalAberto(true);
      setTimeout(() => {
        setModalAberto(false);
        carregarEquinos();
      }, 3000);
    } catch (error) {
      console.error('Erro ao retornar equino:', error);
    }
  };

  const gerarPDF = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(14);
    doc.text('Lista de Equinos Baixados', 14, 15);
  
    const dadosTabela = resultado.map(eq => {
      const baixa = equinosBaixados.find(b => b.idEquino === eq.id && !b.dataRetorno);
      const dataBaixa = baixa ? new Date(baixa.dataBaixa).toLocaleDateString('pt-BR') : '—';
  
      return [
        eq.name,
        eq.raca,
        eq.pelagem,
        eq.numeroRegistro,
        dataBaixa,
        eq.status
      ];
    });
  
    doc.autoTable({
      head: [['Nome', 'Raça', 'Pelagem', 'Registro', 'Data da Baixa', 'Status']],
      body: dadosTabela,
      startY: 25,
    });
  
    doc.save('equinos_baixados.pdf');
  };  

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2 className='titulo-lista'>
          Lista de Equinos Baixados
          <span className="total-atendimentos ms-0">
            Total de equinos: {resultado.length}
          </span>
        </h2>

        <div className='d-flex justify-content-end'>
          <input
            type='date'
            className='form-control'
            value={filtroInicio}
            onChange={e => setFiltroInicio(e.target.value)}
          />
          <span className='m-2'>Até</span>
          <input
            type='date'
            className='form-control'
            value={filtroFim}
            onChange={e => setFiltroFim(e.target.value)}
          />

          <select
            className='form-control ms-3 me-3'
            value={filtroNome}
            onChange={e => setFiltroNome(e.target.value)}
          >
            <option value=''>Todos os equinos</option>
            {equinos.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>

          <button className='btn btn-primary me-2' onClick={filtrar}>Filtrar</button>
          <button className='btn btn-secondary me-2' title="Limpar Campos" onClick={limparFiltros}>Limpar</button>
          <button className='btn btn-outline-danger' title="Gerar PDF" onClick={gerarPDF}>PDF</button>
        </div>
      </div>

      <table className="table table-hover">
            <thead>
            <tr>
                <th>Nome</th>
                <th>Raça</th>
                <th>Pelagem</th>
                <th>Registro</th>
                <th>Data da Baixa</th>
                <th>Status</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {resultado.map(eq => {
                const registroBaixa = equinosBaixados.find(b => b.idEquino === eq.id && !b.dataRetorno);
                const dataBaixaFormatada = registroBaixa
                ? new Date(registroBaixa.dataBaixa).toLocaleDateString('pt-BR')
                : '—';

                return (
                <tr key={eq.id}>
                    <td>{eq.name}</td>
                    <td>{eq.raca}</td>
                    <td>{eq.pelagem}</td>
                    <td>{eq.numeroRegistro}</td>
                    <td>{dataBaixaFormatada}</td>
                    <td>{eq.status}</td>
                    <td className="text-end">
                    <Link to={`/atendimento/${eq.id}`} className="btn btn-sm btn-outline-info me-2" title='Atendimento'>
                        <i className="bi bi-clipboard2-pulse"></i>
                    </Link>
                    <button onClick={() => handleRetorno(eq)} className="btn btn-sm btn-outline-success" title='Retornar as atividades'>
                        <i className="bi bi-chat-square-heart"></i>
                    </button>
                    </td>
                </tr>
                );
            })}
            </tbody>

      </table>

      <Modal
        isOpen={modalAberto}
        onRequestClose={() => setModalAberto(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modalContent text-center">
          <h4 className="text-success">✅ Equino retornado com sucesso!</h4>
        </div>
      </Modal>
    </div>
  );
};

export default VeterinariaEquinosBaixadosList;

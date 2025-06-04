import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api';
import Navbar from '../../components/navbar/Navbar';
import BotaoAcao from '../../components/botoes/BotaoAcaoRows.jsx';
import CabecalhoEquinos from '../../components/cabecalhoEquinoList/CabecalhoEquinos.jsx';
import Modal from 'react-modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

Modal.setAppElement('#root');

const VeterinariaEquinosBaixadosList = () => {
  const [equinos, setEquinos] = useState([]);
  const [equinosBaixados, setEquinosBaixados] = useState([]);
  const [botoes, setBotoes] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [resultado, setResultado] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    carregarEquinos();
    setBotoes(['atendimento', 'retorno']);
  }, []);

  const carregarEquinos = async () => {
    try {
      const [resEquinos, resBaixados] = await Promise.all([
        axios.get('/equinos'),
        axios.get('/equinosBaixados'),
      ]);

      const baixadosAtivos = resEquinos.data.filter(eq => eq.status === 'Baixado');
      setEquinos(baixadosAtivos);
      setEquinosBaixados(resBaixados.data);

      const resultadoInicial = baixadosAtivos.filter(eq => {
        const registro = resBaixados.data.find(b => b.idEquino === eq.id && !b.dataRetorno);
        return !!registro;
      });

      setResultado(resultadoInicial);
    } catch (error) {
      console.error('Erro ao carregar equinos:', error);
    }
  };

  const filtrar = () => {
    const filtrados = equinos.filter(eq => {
      const registro = equinosBaixados.find(b => b.idEquino === eq.id && !b.dataRetorno);
      if (!registro) return false;

      const nomeOK = !filtroNome || eq.id.toString() === filtroNome;
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
    filtrar();
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

  return (
    <div className="container-fluid mt-page">
      <Navbar />

      <div className='d-flex justify-content-between align-items-center mb-4'>
        <CabecalhoEquinos
          titulo="Lista de Equinos Baixados"
          equinos={equinos}
          filtroNome={filtroNome}
          setFiltroNome={setFiltroNome}
          filtroInicio={filtroInicio}
          setFiltroInicio={setFiltroInicio}
          filtroFim={filtroFim}
          setFiltroFim={setFiltroFim}
          onFiltrar={filtrar}
          limparFiltros={limparFiltros}
          gerarPDF={gerarPDF}
          mostrarDatas={true}
          mostrarBotoesPDF={true}
          resultado={resultado}
        />
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
            <th className="text-end">Ações</th>
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
                  {botoes.includes('atendimento') && (
                    <BotaoAcao
                      to={`/atendimento/${eq.id}`}
                      title="Atendimento"
                      className="botao-atendimento"
                      icone="bi-clipboard2-pulse"
                    />
                  )}
                  {botoes.includes('retorno') && (
                    <BotaoAcao
                      onClick={() => handleRetorno(eq)}
                      title="Retornar às atividades"
                      className="botao-retorno"
                      icone="bi-arrow-up-circle"
                    />
                  )}
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
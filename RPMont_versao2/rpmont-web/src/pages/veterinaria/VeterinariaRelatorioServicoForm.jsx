import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from '../../api';
import './Veterinaria.css';

const VeterinariaRelatorioServicoForm = () => {
  const [militar, setMilitar] = useState(null);
  const [dadosServico, setDadosServico] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [passagemServico, setPassagemServico] = useState('');
  const [dataServico, setDataServico] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [mensagemErroModal, setMensagemErroModal] = useState('');

  const navigate = useNavigate();

  // FORMATOS
  const formatarData = (dataISO) => {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const formatarDataPosterior = (dataISO) => {
    const data = new Date(dataISO);
    data.setDate(data.getDate() + 1);
    return formatarData(data.toISOString().split('T')[0]);
  };

  useEffect(() => {
    const militarLogado = {
      nomeDeGuerra: 'Cabo Lima',
      matricula: '1234567',
      postGrad: 'Cabo',
    };
    setMilitar(militarLogado);
  }, []);

  // CONFIRMAR MODAL
  const confirmarDataServico = () => {
  if (!dataServico) {
    setMensagemErroModal('Por favor, informe a data do serviço.');
    return;
  }

  setMensagemErroModal('');
  setShowModal(false);
  buscarDados();
};

  // BUSCAR DADOS
  const buscarDados = async () => {
    try {
      setCarregando(true);

      const [atendimentosRes, escalasRes, baixadosRes, equinosRes] = await Promise.all([
        axios.get(`/atendimentos?data=${dataServico}`),
        axios.get(`/escala?data=${dataServico}`),
        axios.get(`/equinosBaixados?data=${dataServico}`),
        axios.get(`/equinos`)
      ]);

      const equinos = equinosRes.data;

      const atendimentos = atendimentosRes.data.map(item => {
        const eq = equinos.find(e => e.id === item.idEquino);
        return {
          ...item,
          name: eq?.name || 'Desconhecido',
          raca: eq?.raca || '-',
          numeroRegistro: eq?.numeroRegistro || '-',
          sexo: eq?.sexo || '-',
          unidade: eq?.unidade || '-',
        };
      });

      const escalas = escalasRes.data.map(item => {
        const eq = equinos.find(e => e.id === item.idEquino);
        return {
          ...item,
          name: eq?.name || 'Desconhecido',
          raca: eq?.raca || '-',
          numeroRegistro: eq?.numeroRegistro || '-',
          sexo: eq?.sexo || '-',
          localTrabalho: item.localTrabalho,
          jornadaTrabalho: item.jornadaTrabalho,
          cavaleiro: item.cavaleiro,
        };
      });

      const baixados = baixadosRes.data.map(item => {
        const eq = equinos.find(e => e.id === item.idEquino);
        return {
          ...item,
          nomeEquino: eq?.name || 'Desconhecido',
          dataBaixa: item.dataBaixa
        };
      });

      setDadosServico({
        data: dataServico,
        atendimentos,
        escalas,
        baixados
      });

    } catch (error) {
      console.error("Erro ao buscar dados do serviço", error);
    } finally {
      setCarregando(false);
    }
  };

  // SALVAR SIMULADO
  const salvarRelatorio = () => {
    alert("Relatório salvo com sucesso (simulado)!");
  };

const gerarPDF = () => {
  if (!dadosServico || !militar) {
    alert("Por favor, clique em 'Buscar Dados' antes de gerar o PDF.");
    return;
  }

  const doc = new jsPDF();
  let yPos = 15;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Relatório de Serviço - ${formatarData(dadosServico.data)}`, 14, yPos);
  yPos += 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Nome de Guerra:", 14, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(militar.nomeDeGuerra, 55, yPos);
  yPos += 7;

  doc.setFont("helvetica", "bold");
  doc.text("Matrícula:", 14, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(militar.matricula, 55, yPos);
  yPos += 7;

  doc.setFont("helvetica", "bold");
  doc.text("Posto/Graduação:", 14, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(militar.postGrad, 55, yPos);
  yPos += 10;

  // PASSAGEM DE SERVIÇO
  doc.setFont("helvetica", "bold");
  doc.text("Passagem de Serviço:", 14, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  const textoPassagem = passagemServico.trim()
    ? doc.splitTextToSize(passagemServico, 180)
    : ["Sem alteração"];
  doc.text(textoPassagem, 14, yPos);
  yPos += textoPassagem.length * 6 + 4;

  // OBSERVAÇÕES
  doc.setFont("helvetica", "bold");
  doc.text("Observações do Serviço:", 14, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  const textoObs = observacao.trim()
    ? doc.splitTextToSize(observacao, 180)
    : ["Sem alteração"];
  doc.text(textoObs, 14, yPos);
  yPos += textoObs.length * 6 + 4;

  // TABELA DE ATENDIMENTOS
  if (dadosServico.atendimentos?.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Equinos Atendidos", 14, yPos);
    doc.autoTable({
      startY: yPos + 5,
      head: [["Nome", "Raça", "Registro", "Sexo", "Unidade", "Consulta"]],
      body: dadosServico.atendimentos.map(item => [
        item.name || "",
        item.raca || "",
        item.numeroRegistro || "",
        item.sexo || "",
        item.unidade || "",
        item.textoConsulta || ""
      ]),
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  // TABELA DE ESCALAS
  if (dadosServico.escalas?.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Escalas dos Equinos", 14, yPos);
    doc.autoTable({
      startY: yPos + 5,
      head: [["Nome", "Raça", "Registro", "Sexo", "Local", "Jornada", "Cavaleiro"]],
      body: dadosServico.escalas.map(item => [
        item.name || "",
        item.raca || "",
        item.numeroRegistro || "",
        item.sexo || "",
        item.localTrabalho || "",
        item.jornadaTrabalho || "",
        item.cavaleiro || ""
      ]),
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  // TABELA DE BAIXADOS
  if (dadosServico.baixados?.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Equinos Baixados", 14, yPos);
    doc.autoTable({
      startY: yPos + 5,
      head: [["Nome", "Data de Baixa"]],
      body: dadosServico.baixados.map(item => [
        item.nomeEquino || "",
        item.dataBaixa ? formatarData(item.dataBaixa) : "-"
      ]),
    });
  }

  // Finalizar
  doc.save(`RelatorioServico_${dadosServico.data}.pdf`);
};


  return (
    <div className="relatorio-container">
      <h2 className="titulo">Relatório de Serviço</h2>

      {militar && (
        <div className="box-info militar-box">
          <p><strong>Nome de Guerra:</strong> {militar.nomeDeGuerra}</p>
          <p><strong>Matrícula:</strong> {militar.matricula}</p>
          <p><strong>Posto/Graduação:</strong> {militar.postGrad}</p>

          <div className="mt-3">
            <label><strong>Passagem de Serviço:</strong></label>
            <textarea
              className="form-control"
              rows="3"
              value={passagemServico}
              onChange={(e) => setPassagemServico(e.target.value)}
              placeholder="Informações sobre a passagem de serviço..."
            />
          </div>

          <div className="mt-3">
            <label><strong>Observações do Serviço:</strong></label>
            <textarea
              className="form-control"
              rows="4"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Descreva aqui as observações relevante do serviço..."
            />
          </div>
        </div>
      )}

      <div className="mb-3 d-flex gap-2 mt-3 no-print">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/inicio')}>Voltar</button>
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setMensagemErroModal('');
            setDataServico('');
            setShowModal(true);
          }}
        >
          Buscar Dados
        </button>
        <button className="btn btn-outline-info" onClick={() => window.print()}>Imprimir</button>
        <button className="btn btn-outline-danger" onClick={gerarPDF} disabled={!dadosServico}>Exportar PDF</button>
      </div>

      {carregando && <p>Carregando dados do serviço...</p>}

      {dadosServico && (
        <div className="box-info servico-box">
          <h4>
            Dados do Serviço - dia {formatarData(dadosServico.data)} para o dia {formatarDataPosterior(dadosServico.data)}
          </h4>

          {/* Equinos Atendidos */}
          <h5 className="mt-4">Equinos Atendidos</h5>
          {dadosServico.atendimentos.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Raça</th>
                  <th>Registro</th>
                  <th>Sexo</th>
                  <th>Unidade</th>
                  <th>Consulta</th>
                </tr>
              </thead>
              <tbody>
                {dadosServico.atendimentos.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.raca}</td>
                    <td>{item.numeroRegistro}</td>
                    <td>{item.sexo}</td>
                    <td>{item.unidade}</td>
                    <td>{item.textoConsulta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhum atendimento registrado.</p>}

          {/* Escalas */}
          <h5 className="mt-4">Escalas dos Equinos</h5>
          {dadosServico.escalas.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Raça</th>
                  <th>Registro</th>
                  <th>Sexo</th>
                  <th>Local</th>
                  <th>Jornada</th>
                  <th>Cavaleiro</th>
                </tr>
              </thead>
              <tbody>
                {dadosServico.escalas.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.raca}</td>
                    <td>{item.numeroRegistro}</td>
                    <td>{item.sexo}</td>
                    <td>{item.localTrabalho}</td>
                    <td>{item.jornadaTrabalho}</td>
                    <td>{item.cavaleiro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhuma escala registrada.</p>}

          {/* Baixados */}
          <h5 className="mt-4">Equinos Baixados</h5>
          {dadosServico.baixados.length > 0 ? (
            <ul>
              {dadosServico.baixados.map((item, i) => (
                <li key={i}>{item.nomeEquino} - Baixado em {formatarData(item.dataBaixa)}</li>
              ))}
            </ul>
          ) : <p>Nenhum equino baixado.</p>}

          <div className="mt-4 text-end no-print">
            <button className="btn btn-outline-success" onClick={salvarRelatorio}>Salvar</button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-calendar3 me-2"></i>Informe a Data do Serviço
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="date"
                  className="form-control"
                  value={dataServico}
                  onChange={(e) => setDataServico(e.target.value)}
                />
                {mensagemErroModal && (
                  <p className="text-danger mt-2">{mensagemErroModal}</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={confirmarDataServico}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VeterinariaRelatorioServicoForm;
